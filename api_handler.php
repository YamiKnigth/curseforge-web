<?php
// Incluir el archivo de configuración una sola vez
require_once 'config.php';

// Función para realizar la llamada a la API de CurseForge
function callCurseForgeAPI($endpoint, $apiKey) {
    $url = 'https://api.curseforge.com' . $endpoint;
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'x-api-key: ' . $apiKey
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpcode >= 400) {
        http_response_code($httpcode);
        // Devolver un error JSON para que el frontend lo pueda interpretar
        echo json_encode(['error' => 'API Error', 'status' => $httpcode, 'response' => $response]);
        exit;
    }

    return $response;
}

// Determinar la acción a realizar
$action = isset($_GET['action']) ? $_GET['action'] : '';

header('Content-Type: application/json');

switch ($action) {
    case 'getMinecraftVersions':
        $response = callCurseForgeAPI('/v1/minecraft/version', CURSEFORGE_API_KEY);
        echo $response;
        break;

    case 'getModLoaders':
        $response = callCurseForgeAPI('/v1/minecraft/modloader', CURSEFORGE_API_KEY);
        echo $response;
        break;
    
    // --- NUEVA ACCIÓN ---
    case 'getModloaderVersions':
        if (isset($_GET['gameVersion'])) {
            $gameVersion = urlencode($_GET['gameVersion']);
            $endpoint = "/v1/minecraft/modloaders?version={$gameVersion}";
            $response = callCurseForgeAPI($endpoint, CF_API_KEY);
            echo $response;
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Game version is required.']);
        }
        break;

    case 'searchMods':
        if (isset($_GET['gameVersion']) && isset($_GET['searchFilter'])) {
            $gameVersion = urlencode($_GET['gameVersion']);
            $searchFilter = urlencode($_GET['searchFilter']);
            
            // Mapeo de nombres de modloaders a sus tipos numéricos según la API
            $modloaderTypes = [
                'forge' => 1,
                'fabric' => 4,
                'quilt' => 5,
                'neoforge' => 6
            ];

            $endpoint = "/v1/mods/search?gameId=432&gameVersion={$gameVersion}&searchFilter={$searchFilter}";
            
            // Añadir el filtro de modloader si se especificó uno válido
            if (isset($_GET['modloader']) && !empty($_GET['modloader'])) {
                $modloaderName = strtolower($_GET['modloader']);
                if (array_key_exists($modloaderName, $modloaderTypes)) {
                    $modloaderType = $modloaderTypes[$modloaderName];
                    $endpoint .= "&modLoaderType={$modloaderType}";
                }
            }
            
            $response = callCurseForgeAPI($endpoint, CURSEFORGE_API_KEY);
            echo $response;
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Game version and search filter are required.']);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action specified.']);
        break;
}
?>

