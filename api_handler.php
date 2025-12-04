<?php
/**
 * api_handler.php
 * Controlador principal del backend para gestionar todas las peticiones a la API,
 * la base de datos y la API de CurseForge
 */

session_start();
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// =============================================================================
// FUNCIONES DE UTILIDAD
// =============================================================================

/**
 * Realiza una petición a la API de CurseForge
 */
function call_curseforge_api($endpoint, $method = 'GET', $data = null) {
    $url = CURSEFORGE_API_BASE . $endpoint;
    $headers = get_curseforge_api_headers();
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    if ($method === 'POST' && $data !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 400) {
        return ['error' => 'API Error', 'status' => $httpCode, 'response' => $response];
    }
    
    return json_decode($response, true);
}

/**
 * Envía una respuesta JSON y termina la ejecución
 */
function send_json_response($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

/**
 * Verifica si el usuario está autenticado
 */
function is_authenticated() {
    return isset($_SESSION['user_id']);
}

/**
 * Requiere autenticación para continuar
 */
function require_auth() {
    if (!is_authenticated()) {
        send_json_response(['error' => 'No autenticado'], 401);
    }
}

// =============================================================================
// ENRUTADOR DE ACCIONES
// =============================================================================

$action = $_GET['action'] ?? $_POST['action'] ?? '';

try {
    switch ($action) {
        // =====================================================================
        // AUTENTICACIÓN
        // =====================================================================
        
        case 'register':
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                send_json_response(['error' => 'Usuario y contraseña requeridos'], 400);
            }
            
            if (strlen($username) < 3 || strlen($username) > 50) {
                send_json_response(['error' => 'El usuario debe tener entre 3 y 50 caracteres'], 400);
            }
            
            if (strlen($password) < 6) {
                send_json_response(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
            }
            
            $conn = get_db_connection();
            $passwordHash = password_hash($password, PASSWORD_BCRYPT);
            
            $stmt = $conn->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
            $stmt->bind_param("ss", $username, $passwordHash);
            
            if ($stmt->execute()) {
                $userId = $stmt->insert_id;
                $_SESSION['user_id'] = $userId;
                $_SESSION['username'] = $username;
                
                send_json_response([
                    'success' => true,
                    'message' => 'Usuario registrado exitosamente',
                    'user' => ['id' => $userId, 'username' => $username]
                ]);
            } else {
                if ($conn->errno === 1062) {
                    send_json_response(['error' => 'El usuario ya existe'], 409);
                }
                send_json_response(['error' => 'Error al registrar usuario'], 500);
            }
            break;
        
        case 'login':
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';
            
            if (empty($username) || empty($password)) {
                send_json_response(['error' => 'Usuario y contraseña requeridos'], 400);
            }
            
            $conn = get_db_connection();
            $stmt = $conn->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
            $stmt->bind_param("s", $username);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($row = $result->fetch_assoc()) {
                if (password_verify($password, $row['password_hash'])) {
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['username'] = $row['username'];
                    
                    send_json_response([
                        'success' => true,
                        'message' => 'Inicio de sesión exitoso',
                        'user' => ['id' => $row['id'], 'username' => $row['username']]
                    ]);
                }
            }
            
            send_json_response(['error' => 'Usuario o contraseña incorrectos'], 401);
            break;
        
        case 'logout':
            session_destroy();
            send_json_response(['success' => true, 'message' => 'Sesión cerrada']);
            break;
        
        case 'check_session':
            if (is_authenticated()) {
                send_json_response([
                    'authenticated' => true,
                    'user' => [
                        'id' => $_SESSION['user_id'],
                        'username' => $_SESSION['username']
                    ]
                ]);
            } else {
                send_json_response(['authenticated' => false]);
            }
            break;
        
        // =====================================================================
        // API DE CURSEFORGE
        // =====================================================================
        
        case 'search_mods':
            $searchTerm = $_GET['searchTerm'] ?? '';
            $minecraftVersion = $_GET['minecraftVersion'] ?? '';
            $pageSize = $_GET['pageSize'] ?? 20;
            $index = $_GET['index'] ?? 0;
            
            $endpoint = "/v1/mods/search?gameId=432&pageSize={$pageSize}&index={$index}";
            
            if (!empty($searchTerm)) {
                $endpoint .= "&searchFilter=" . urlencode($searchTerm);
            }
            
            if (!empty($minecraftVersion)) {
                $endpoint .= "&gameVersion=" . urlencode($minecraftVersion);
            }
            
            $response = call_curseforge_api($endpoint);
            send_json_response($response);
            break;
        
        case 'get_mod_details':
            $modId = $_GET['modId'] ?? '';
            
            if (empty($modId)) {
                send_json_response(['error' => 'ID de mod requerido'], 400);
            }
            
            $endpoint = "/v1/mods/{$modId}";
            $response = call_curseforge_api($endpoint);
            send_json_response($response);
            break;
        
        case 'get_mod_files':
            $modId = $_GET['modId'] ?? '';
            $minecraftVersion = $_GET['minecraftVersion'] ?? '';
            
            if (empty($modId)) {
                send_json_response(['error' => 'ID de mod requerido'], 400);
            }
            
            $endpoint = "/v1/mods/{$modId}/files";
            
            if (!empty($minecraftVersion)) {
                $endpoint .= "?gameVersion=" . urlencode($minecraftVersion);
            }
            
            $response = call_curseforge_api($endpoint);
            send_json_response($response);
            break;
        
        case 'get_minecraft_versions':
            $endpoint = "/v1/minecraft/version";
            $response = call_curseforge_api($endpoint);
            send_json_response($response);
            break;
        
        // =====================================================================
        // GESTIÓN DE MODPACKS (CRUD)
        // =====================================================================
        
        case 'create_modpack':
            require_auth();
            
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $minecraftVersion = $_POST['minecraft_version'] ?? '';
            $mods = json_decode($_POST['mods'] ?? '[]', true);
            
            if (empty($name) || empty($minecraftVersion)) {
                send_json_response(['error' => 'Nombre y versión de Minecraft requeridos'], 400);
            }
            
            $conn = get_db_connection();
            $conn->begin_transaction();
            
            try {
                // Insertar modpack
                $stmt = $conn->prepare("INSERT INTO modpacks (user_id, name, description, minecraft_version) VALUES (?, ?, ?, ?)");
                $stmt->bind_param("isss", $_SESSION['user_id'], $name, $description, $minecraftVersion);
                $stmt->execute();
                $modpackId = $stmt->insert_id;
                
                // Insertar mods
                if (!empty($mods)) {
                    $stmtMod = $conn->prepare("INSERT INTO modpack_mods (modpack_id, curseforge_project_id, curseforge_file_id, required) VALUES (?, ?, ?, ?)");
                    
                    foreach ($mods as $mod) {
                        $projectId = $mod['projectId'];
                        $fileId = $mod['fileId'];
                        $required = $mod['required'] ?? true;
                        
                        $stmtMod->bind_param("iiii", $modpackId, $projectId, $fileId, $required);
                        $stmtMod->execute();
                    }
                }
                
                $conn->commit();
                
                send_json_response([
                    'success' => true,
                    'message' => 'Modpack creado exitosamente',
                    'modpack_id' => $modpackId
                ]);
            } catch (Exception $e) {
                $conn->rollback();
                send_json_response(['error' => 'Error al crear modpack: ' . $e->getMessage()], 500);
            }
            break;
        
        case 'get_modpacks':
            require_auth();
            
            $conn = get_db_connection();
            $stmt = $conn->prepare("SELECT id, name, description, minecraft_version, created_at FROM modpacks WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            $modpacks = [];
            while ($row = $result->fetch_assoc()) {
                $modpacks[] = $row;
            }
            
            send_json_response(['success' => true, 'modpacks' => $modpacks]);
            break;
        
        case 'get_modpack':
            require_auth();
            
            $modpackId = $_GET['modpack_id'] ?? '';
            
            if (empty($modpackId)) {
                send_json_response(['error' => 'ID de modpack requerido'], 400);
            }
            
            $conn = get_db_connection();
            
            // Obtener información del modpack
            $stmt = $conn->prepare("SELECT id, name, description, minecraft_version, created_at FROM modpacks WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $modpackId, $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($modpack = $result->fetch_assoc()) {
                // Obtener mods del modpack
                $stmtMods = $conn->prepare("SELECT curseforge_project_id, curseforge_file_id, required FROM modpack_mods WHERE modpack_id = ?");
                $stmtMods->bind_param("i", $modpackId);
                $stmtMods->execute();
                $resultMods = $stmtMods->get_result();
                
                $mods = [];
                while ($mod = $resultMods->fetch_assoc()) {
                    $mods[] = $mod;
                }
                
                $modpack['mods'] = $mods;
                
                send_json_response(['success' => true, 'modpack' => $modpack]);
            } else {
                send_json_response(['error' => 'Modpack no encontrado'], 404);
            }
            break;
        
        case 'update_modpack':
            require_auth();
            
            $modpackId = $_POST['modpack_id'] ?? '';
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $minecraftVersion = $_POST['minecraft_version'] ?? '';
            $mods = json_decode($_POST['mods'] ?? '[]', true);
            
            if (empty($modpackId) || empty($name) || empty($minecraftVersion)) {
                send_json_response(['error' => 'ID, nombre y versión de Minecraft requeridos'], 400);
            }
            
            $conn = get_db_connection();
            $conn->begin_transaction();
            
            try {
                // Verificar que el modpack pertenece al usuario
                $stmt = $conn->prepare("SELECT id FROM modpacks WHERE id = ? AND user_id = ?");
                $stmt->bind_param("ii", $modpackId, $_SESSION['user_id']);
                $stmt->execute();
                
                if ($stmt->get_result()->num_rows === 0) {
                    send_json_response(['error' => 'Modpack no encontrado'], 404);
                }
                
                // Actualizar modpack
                $stmt = $conn->prepare("UPDATE modpacks SET name = ?, description = ?, minecraft_version = ? WHERE id = ?");
                $stmt->bind_param("sssi", $name, $description, $minecraftVersion, $modpackId);
                $stmt->execute();
                
                // Eliminar mods existentes
                $stmt = $conn->prepare("DELETE FROM modpack_mods WHERE modpack_id = ?");
                $stmt->bind_param("i", $modpackId);
                $stmt->execute();
                
                // Insertar nuevos mods
                if (!empty($mods)) {
                    $stmtMod = $conn->prepare("INSERT INTO modpack_mods (modpack_id, curseforge_project_id, curseforge_file_id, required) VALUES (?, ?, ?, ?)");
                    
                    foreach ($mods as $mod) {
                        $projectId = $mod['projectId'];
                        $fileId = $mod['fileId'];
                        $required = $mod['required'] ?? true;
                        
                        $stmtMod->bind_param("iiii", $modpackId, $projectId, $fileId, $required);
                        $stmtMod->execute();
                    }
                }
                
                $conn->commit();
                
                send_json_response([
                    'success' => true,
                    'message' => 'Modpack actualizado exitosamente'
                ]);
            } catch (Exception $e) {
                $conn->rollback();
                send_json_response(['error' => 'Error al actualizar modpack: ' . $e->getMessage()], 500);
            }
            break;
        
        case 'delete_modpack':
            require_auth();
            
            $modpackId = $_POST['modpack_id'] ?? '';
            
            if (empty($modpackId)) {
                send_json_response(['error' => 'ID de modpack requerido'], 400);
            }
            
            $conn = get_db_connection();
            $stmt = $conn->prepare("DELETE FROM modpacks WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $modpackId, $_SESSION['user_id']);
            
            if ($stmt->execute() && $stmt->affected_rows > 0) {
                send_json_response([
                    'success' => true,
                    'message' => 'Modpack eliminado exitosamente'
                ]);
            } else {
                send_json_response(['error' => 'Modpack no encontrado'], 404);
            }
            break;
        
        // =====================================================================
        // IMPORTACIÓN Y EXPORTACIÓN
        // =====================================================================
        
        case 'export_modpack':
            require_auth();
            
            $modpackId = $_GET['modpack_id'] ?? '';
            
            if (empty($modpackId)) {
                send_json_response(['error' => 'ID de modpack requerido'], 400);
            }
            
            $conn = get_db_connection();
            
            // Obtener información del modpack
            $stmt = $conn->prepare("SELECT name, description, minecraft_version FROM modpacks WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $modpackId, $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($modpack = $result->fetch_assoc()) {
                // Obtener mods del modpack
                $stmtMods = $conn->prepare("SELECT curseforge_project_id, curseforge_file_id, required FROM modpack_mods WHERE modpack_id = ?");
                $stmtMods->bind_param("i", $modpackId);
                $stmtMods->execute();
                $resultMods = $stmtMods->get_result();
                
                $files = [];
                while ($mod = $resultMods->fetch_assoc()) {
                    $files[] = [
                        'projectID' => (int)$mod['curseforge_project_id'],
                        'fileID' => (int)$mod['curseforge_file_id'],
                        'required' => (bool)$mod['required']
                    ];
                }
                
                // Crear manifest.json
                $manifest = [
                    'minecraft' => [
                        'version' => $modpack['minecraft_version'],
                        'modLoaders' => [
                            [
                                'id' => 'forge-latest',
                                'primary' => true
                            ]
                        ]
                    ],
                    'manifestType' => 'minecraftModpack',
                    'manifestVersion' => 1,
                    'name' => $modpack['name'],
                    'version' => '1.0.0',
                    'author' => $_SESSION['username'],
                    'description' => $modpack['description'] ?? '',
                    'files' => $files
                ];
                
                // Crear archivo ZIP
                $zipFilename = tempnam(sys_get_temp_dir(), 'modpack_') . '.zip';
                $zip = new ZipArchive();
                
                if ($zip->open($zipFilename, ZipArchive::CREATE) === TRUE) {
                    $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
                    $zip->close();
                    
                    // Enviar archivo
                    header('Content-Type: application/zip');
                    header('Content-Disposition: attachment; filename="' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $modpack['name']) . '.zip"');
                    header('Content-Length: ' . filesize($zipFilename));
                    readfile($zipFilename);
                    
                    // Eliminar archivo temporal
                    unlink($zipFilename);
                    exit;
                } else {
                    send_json_response(['error' => 'Error al crear archivo ZIP'], 500);
                }
            } else {
                send_json_response(['error' => 'Modpack no encontrado'], 404);
            }
            break;
        
        case 'import_modpack':
            require_auth();
            
            if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
                send_json_response(['error' => 'No se recibió ningún archivo o hubo un error en la carga'], 400);
            }
            
            $uploadedFile = $_FILES['file']['tmp_name'];
            $zip = new ZipArchive();
            
            if ($zip->open($uploadedFile) === TRUE) {
                $manifestContent = $zip->getFromName('manifest.json');
                
                if ($manifestContent === false) {
                    send_json_response(['error' => 'El archivo ZIP no contiene un manifest.json'], 400);
                }
                
                $manifest = json_decode($manifestContent, true);
                
                if (!$manifest) {
                    send_json_response(['error' => 'El manifest.json no es válido'], 400);
                }
                
                // Extraer información
                $name = $manifest['name'] ?? 'Modpack Importado';
                $description = $manifest['description'] ?? '';
                $minecraftVersion = $manifest['minecraft']['version'] ?? '';
                $files = $manifest['files'] ?? [];
                
                if (empty($minecraftVersion) || empty($files)) {
                    send_json_response(['error' => 'El manifest.json no contiene información completa'], 400);
                }
                
                // Crear modpack en la base de datos
                $conn = get_db_connection();
                $conn->begin_transaction();
                
                try {
                    $stmt = $conn->prepare("INSERT INTO modpacks (user_id, name, description, minecraft_version) VALUES (?, ?, ?, ?)");
                    $stmt->bind_param("isss", $_SESSION['user_id'], $name, $description, $minecraftVersion);
                    $stmt->execute();
                    $modpackId = $stmt->insert_id;
                    
                    // Insertar mods
                    $stmtMod = $conn->prepare("INSERT INTO modpack_mods (modpack_id, curseforge_project_id, curseforge_file_id, required) VALUES (?, ?, ?, ?)");
                    
                    foreach ($files as $file) {
                        $projectId = $file['projectID'];
                        $fileId = $file['fileID'];
                        $required = $file['required'] ?? true;
                        
                        $stmtMod->bind_param("iiii", $modpackId, $projectId, $fileId, $required);
                        $stmtMod->execute();
                    }
                    
                    $conn->commit();
                    $zip->close();
                    
                    send_json_response([
                        'success' => true,
                        'message' => 'Modpack importado exitosamente',
                        'modpack_id' => $modpackId
                    ]);
                } catch (Exception $e) {
                    $conn->rollback();
                    send_json_response(['error' => 'Error al importar modpack: ' . $e->getMessage()], 500);
                }
            } else {
                send_json_response(['error' => 'No se pudo abrir el archivo ZIP'], 400);
            }
            break;
        
        default:
            send_json_response(['error' => 'Acción no válida'], 400);
            break;
    }
} catch (Exception $e) {
    error_log("Error en api_handler.php: " . $e->getMessage());
    send_json_response(['error' => 'Error interno del servidor'], 500);
}
?>
