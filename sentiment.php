ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
<?php

// Database connection details
$servername = "mysql.simplysentiment.dreamhosters.com";
$username = "simplysentimentd";
$password = "Fs!tNAJU";
$dbname = "simplysentiment_dreamhos";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Sanitize user input to prevent SQL injection
function sanitizeInput($input) {
    global $conn;
    return $conn->real_escape_string(strip_tags($input));
}

// Handle sentiment updates
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $action = isset($_POST["action"]) ? sanitizeInput($_POST["action"]) : "";
    
    if ($action === "add") {
            $ticker = sanitizeInput($_POST["ticker"]);
            // Check if the stock already exists
            $checkSql = "SELECT * FROM stocks WHERE ticker = '$ticker'";
            $checkResult = $conn->query($checkSql);
            if ($checkResult->num_rows === 0) {
                // Insert the new stock into the database
                $insertSql = "INSERT INTO stocks (ticker) VALUES ('$ticker')";
                if ($conn->query($insertSql) === TRUE) {
                echo json_encode(array("message" => "Stock added successfully"));
                } else {
                echo json_encode(array("error" => "Error adding stock: " . $conn->error));
                }
            } else {
                echo json_encode(array("message" => "Stock already exists"));
            }
        }
    } else {
        $ticker = sanitizeInput($_POST["ticker"]);
        $sentiment = sanitizeInput($_POST["sentiment"]);
        
        // Update the sentiment in the database
        $updateSql = "UPDATE stocks SET $sentiment = $sentiment + 1 WHERE ticker = '$ticker'";
        if ($conn->query($updateSql) === TRUE) {
            echo json_encode(array("message" => "Sentiment updated successfully"));
        } else {
            echo json_encode(array("error" => "Error updating sentiment: " . $conn->error));
        }
}

// Handle fetching stock data
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    // Fetch the stock data from the database
    $selectSql = "SELECT * FROM stocks";
    $result = $conn->query($selectSql);

    if (!$result) {
        echo json_encode(array("error" => "Error: " . $conn->error));
        exit();
    }
    // Convert the result to an array
    $stocks = array();
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $stocks[] = $row;
        }
    }

    // Send the response as JSON
    header('Content-Type: application/json');
    echo json_encode($stocks);
    exit();
}

$conn->close();
?>