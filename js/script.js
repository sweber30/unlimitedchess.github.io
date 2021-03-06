


//
// Initialize Variables
//

var isGameActive = false;
var isPieceSelected = false;
var selectedSquare = '';
var playerTurn = 0; // Set in gamestart function. 1 = white, 2 = black. Will be used to restrict piece movement.

const startingPosition = { // 1 = white, 2 = black. k = king, q = queen, r = rook, b = bishop, n = knight, p = pawn.
    a8:'r2', b8:'n2', c8:'b2', d8:'q2', e8:'k2', f8:'b2', g8:'n2', h8:'r2',
    a7:'p2', b7:'p2', c7:'p2', d7:'p2', e7:'p2', f7:'p2', g7:'p2', h7:'p2',
    a6:'  ', b6:'  ', c6:'  ', d6:'  ', e6:'  ', f6:'  ', g6:'  ', h6:'  ',
    a5:'  ', b5:'  ', c5:'  ', d5:'  ', e5:'  ', f5:'  ', g5:'  ', h5:'  ',
    a4:'  ', b4:'  ', c4:'  ', d4:'  ', e4:'  ', f4:'  ', g4:'  ', h4:'  ',
    a3:'  ', b3:'  ', c3:'  ', d3:'  ', e3:'  ', f3:'  ', g3:'  ', h3:'  ',
    a2:'p1', b2:'p1', c2:'p1', d2:'p1', e2:'p1', f2:'p1', g2:'p1', h2:'p1',
    a1:'r1', b1:'n1', c1:'b1', d1:'q1', e1:'k1', f1:'b1', g1:'n1', h1:'r1'
}

var pieceLocations = {};
pieceLocations = Object.assign(pieceLocations, startingPosition);

const columns = ["a", "b", "c", "d", "e", "f", "g", "h"];

const blankImage = "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";

var positions = [];

// String to concatenate all new moves
// Format: "1122;1122;1122; ....." 11 = two character starting square, 22 = two character ending square, moves separated by semicolons 
var moves = "";

var movesWithoutPawnOrCapture = 0;

// Remove right click menu.
$(document).ready(function() {
    $('.chessboard').on("contextmenu", function(e) {
        return false;
    });
});




//
// Event Handlers
//

// Runs once the webpage loads
$(document).ready(function() {

    resizeElements();

    // Window resize event handler
    $(window).resize(function() { resizeElements(); });

});

// Resize certain elements based on window size
function resizeElements() {

    var height = window.innerHeight * 0.85;
    var width = window.innerWidth * 0.95;

    var scale;

    scale = Math.min(height, width).toString() + "px";
    fontSize = (16 * Math.min(height, width) / 800).toString().toString() + "pt";

    $('.chessboard').css({
        height: scale,
        width: scale
    });

    $('.rowlabel, .columnlabel').css({
        fontSize: fontSize
    });
}

// Mouse down event handlers for all squares
$('.piece').mousedown(function(event) {

    var id = $(this).parent().attr('id');

    switch (event.which) {

        case 1: // left button
            LeftClickDown(id);
            break;

        case 2: // middle button
            break;

        case 3: // right button
            RightClickDown(id)
            break;

        default: // other unexpected value
            console.log('You have a strange mouse!'); // REMOVE THIS LATER **********

    }
});

// Touch start event handlers for all squares (touch screens)
$('.piece').on('touchstart', function(event) {
    var id = $(this).parent().attr('id');
    LeftClickDown(id);
});

// Mouse up event handlers for all squares
$('.piece').mouseup(function(event) {

    var id = $(this).parent().attr('id');

    switch (event.which) {

        case 1: // left button
            LeftClickUp(id);
            break;

        case 2: // middle button
            break;

        case 3: // right button
            //RightClickUp(id); *****************************************
            break;

        default: // other unexpected value
            console.log('You have a strange mouse!'); // REMOVE THIS LATER **********

    }
});

// Touch end event handlers for all squares (touch screens)
$('.piece').on('touchend', function(event) {

    var id = "";
    var endTarget = document.elementFromPoint(
        event.originalEvent.touches[event.originalEvent.touches.length - 1].pageX,
        event.originalEvent.touches[event.originalEvent.touches.length - 1].pageY
    );
    
    id = $(endTarget).parent().attr('id');

    if (id.length == 2) {
        LeftClickUp(id);
    }
    
});

// Left click down event
function LeftClickDown(id) {
    console.log("Left click down: " + id);

    if (isPieceSelected) { // A piece is already selected

        // Check if new square contains a piece of the same color.
        if (pieceLocations[selectedSquare].substr(1, 1) == pieceLocations[id].substr(1, 1)) {

            // Select the new piece
            selectedSquare = id;

        }

    } else { // No piece is selected

        // Check if square contains a piece that belongs to the player
        if (pieceLocations[id].substr(1, 1) == playerTurn.toString()) {

            // Set isPieceSelected to true, and store square id.
            isPieceSelected = true;
            selectedSquare = id;

        }

    }

}

// Left click up event
function LeftClickUp(id) {
    console.log("Left click up: " + id);

    // check if square is selected
    if (isPieceSelected) {
        
        // check if user is trying to drag the piece
        if (selectedSquare != id) { // click and release on different squares (dragging piece)

            // Check if piece can move to the new square
            if (pieceLocations[selectedSquare].substr(1, 1) != pieceLocations[id].substr(1, 1) && selectedSquare != id && isMoveValid(selectedSquare, id, true)) {

                // Move the piece
                MovePiece(selectedSquare, id);
    
            }
            
            // Reset selected square to nothing
            selectedSquare = '';
            isPieceSelected = false;

        }

    }
    
}

// Right click down event
function RightClickDown(id) {
    console.log("Right click down: " + id);

    // Deselect piece
    isPieceSelected = false;
    selectedSquare = '';

    // Return dragged piece to its square *****************************************************

}

// Right click up event
function RightClickUp(id) {
    console.log("Right click up: " + id);


    // DO STUFF HERE ****************************************
    // is this function needed???

}

// Check if a move is valid
function isMoveValid(oldSquare, newSquare, updateMoves) {
    
    // Set Variables
    var pieceCode = pieceLocations[oldSquare];
    var pieceMoved = pieceCode.substr(0, 1);
    var playerColor = pieceCode.substr(1, 1);
    var kingLocation = findPiece("k" + playerColor).substr(0, 2);
    var kingHasMoved = (moves.indexOf(squareAt('e', (playerColor == 1) ? 1 : 8)) != -1);
    var castleRookPosistion = '  ';

    var isMoveValid = false;
    var isPathBlocked = false;
    var isKingInCheck = false;

    var isCapturing = (pieceLocations[newSquare] != '  ');
    var isPawnMove = (pieceMoved == 'p');

    var xDistance = CalculateXDistance(oldSquare, newSquare);
    var yDistance = CalculateYDistance(oldSquare, newSquare);
    var xDistanceAbs = Math.abs(xDistance);
    var yDistanceAbs = Math.abs(yDistance);

    var oppenentColor = (playerColor == 1) ? 2 : 1;

    var moveID = 0;

    var oldPieceLocations = {};
    oldPieceLocations = Object.assign(oldPieceLocations, pieceLocations);

    //
    // If the answer to any of the following is no, return false and exit the function.
    // Otherwise, return true.
    //

    //
    // Is the destination square occupied by another piece of the same color?
    //

    if (pieceLocations[newSquare].substr(1, 1) == playerColor) {
        return false;
    }

    //
    // Can the piece move in this way?
    //

    switch (pieceMoved) {

        case "k": // King
            if (xDistanceAbs <= 1 && yDistanceAbs <= 1) { // normal move
                isMoveValid = true;
                moveID = 1;
            } else if (xDistanceAbs == 2 && yDistance == 0 && !kingInCheck(kingLocation, playerColor, pieceLocations) && !kingHasMoved) { // castling
                switch (newSquare) {
                    case "c1": // White long castle
                        if (moves.indexOf('a1') == -1) {
                            isMoveValid = true;
                            castleRookPosistion = 'a1';
                        }
                        break;
                        
                    case "g1": // White short castle
                        if (moves.indexOf('h1') == -1) {
                            isMoveValid = true;
                            castleRookPosistion = 'h1';
                        }
                        break;

                    case "c8": // Black long castle
                        if (moves.indexOf('a8') == -1) {
                            isMoveValid = true;
                            castleRookPosistion = 'a8';
                        }
                        break;

                    case "g8": // Black short castle
                        if (moves.indexOf('h8') == -1) {
                            isMoveValid = true;
                            castleRookPosistion = 'h8';
                        }
                        break;

                    default: // invalid castling square
                        isMoveValid = false;
                }
                moveID = 10;
            }
            break;

        case "q": // Queen
            isMoveValid = ((xDistance == 0 || yDistance == 0) || xDistanceAbs == yDistanceAbs);
            moveID = 2;
            break;

        case "r": // Rook
            isMoveValid = (xDistance == 0 || yDistance == 0);
            moveID = 3;
            break;

        case "b": // Bishop
            isMoveValid = (xDistanceAbs == yDistanceAbs);
            moveID = 4;
            break;

        case "n": // Knight
            isMoveValid = (xDistanceAbs == 1 && yDistanceAbs == 2 || xDistanceAbs == 2 && yDistanceAbs == 1);
            moveID = 5;
            break;

        case "p": // Pawn
            if (xDistance == 0) { // Forward pawn move
                if (oldSquare.substr(1, 1) == ((playerColor == 1) ? "2" : "7")) { // Pawn has not moved yet
                    isMoveValid = (yDistance == ((playerColor == 1) ? 1 : -1) || yDistance == ((playerColor == 1) ? 2 : -2));
                    moveID = 6;
                } else { // Pawn has already moved
                    isMoveValid = (yDistance == ((playerColor == 1) ? 1 : -1));
                    moveID = 7;
                }
            } else { // Capturing
                if (pieceLocations[newSquare] == '  ') { // En passant capture

                    if (xDistanceAbs == 1 && (yDistance == ((playerColor == 1) ? 1 : -1))) {

                        var lastMove = moves.split(";")[moves.split(";").length - 2];
                        var captureSquare = squareAt(getFile(newSquare), getRank(newSquare) - ((playerColor == 1) ? 1 : -1));
                        var opponentPawnStartSquare = squareAt(getFile(newSquare), ((oppenentColor == 1) ? 2 : 7));
                        
                        if (getRank(captureSquare) == (6 - playerColor) && pieceLocations[captureSquare] == ('p' + oppenentColor.toString()) && lastMove == opponentPawnStartSquare + captureSquare) {
                            isMoveValid = true;
                            
                            // temporarily delete the captured pawn
                            pieceLocations[captureSquare] = '  ';
                        }

                    }

                    moveID = 8;
                } else { // Normal capture
                    isMoveValid = (xDistanceAbs == 1 && (yDistance == ((playerColor == 1) ? 1 : -1)));
                    moveID = 9;
                }
            }
            break;

        default: // other unexpected values
            console.log('isMoveValid(): Unexpected piece code in piece locations object' + pieceMoved + ' ' + oldSquare + ' ' + newSquare); // TEST PURPOSES... REMOVE THIS LATER ***************************

    }

    if (!isMoveValid) {
        pieceLocations = Object.assign(pieceLocations, oldPieceLocations);
        return false;
    }

    //
    // Is the path blocked by other pieces?
    //

    if (moveID == 2 || moveID == 3 || moveID == 4) { // queen, rook, or bishop

        isPathBlocked = checkPathBlocked(oldSquare, newSquare, false);

    } else if (moveID == 6 || moveID == 7 || moveID == 10) { // forward pawn move (not capturing), castling

        isPathBlocked = checkPathBlocked(oldSquare, newSquare, true);

    } else { // all other moves are a distance of one, and/or do not care if certain squares are occupied

        isPathBlocked = false;

    }

    if (isPathBlocked) {
        pieceLocations = Object.assign(pieceLocations, oldPieceLocations);
        return false;
    }

    //
    // Does this move (not) leave the player in check?
    //

    // Extra test for castling
    if (moveID == 10) {
        var nextSquare = squareAt(columns[(columns.indexOf(getFile(oldSquare)) + columns.indexOf(getFile(newSquare))) / 2], getRank(oldSquare));

        pieceLocations[nextSquare] = pieceLocations[oldSquare];
        pieceLocations[oldSquare] = '  ';

        kingLocation = findPiece("k" + playerColor).substr(0, 2);
        isKingInCheck = kingInCheck(kingLocation, playerColor, pieceLocations);

        if (!isKingInCheck && castleRookPosistion != '  ') {
            pieceLocations[oldSquare] = pieceLocations[nextSquare];
            pieceLocations[nextSquare] = pieceLocations[castleRookPosistion];
            pieceLocations[castleRookPosistion] = '  ';
        }
    }

    // Temporarily update piece location in pieceLocations object.
    pieceLocations[newSquare] = pieceLocations[oldSquare];
    pieceLocations[oldSquare] = '  ';

    // Find king's position.
    kingLocation = findPiece("k" + playerColor).substr(0, 2);

    if (!isKingInCheck) {
        isKingInCheck = kingInCheck(kingLocation, playerColor, pieceLocations);
    }
    
    if (isKingInCheck) {
        pieceLocations = Object.assign(pieceLocations, oldPieceLocations);
        return false;
    }

    // Reset modified piece positions depending on update moves parameter
    if (!updateMoves) {
        pieceLocations = Object.assign(pieceLocations, oldPieceLocations);
    }

    // Increment moves without pawn move or capture counter
    if (updateMoves) {
        if (isPawnMove || isCapturing) {
            movesWithoutPawnOrCapture = 0;
        } else {
            movesWithoutPawnOrCapture += 1;
        }
    }

    return true; // Returns true if the move is valid and doesn't leave the king in check.

}

// Move a piece from one square to another
// *** Important to check if move is valid before moving the piece!
function MovePiece(oldSquare, newSquare) {

    // set new piece locations
    //pieceLocations[newSquare] = pieceLocations[oldSquare];
    //pieceLocations[oldSquare] = '  ';

    // Pawn promote... AUTO PROMOTES TO QUEEN FOR NOW. CHANGE THIS LATER!!! ******************************************************
    if ((pieceLocations[newSquare] == 'p2' && newSquare.substr(1, 1) == '1') || (pieceLocations[newSquare] == 'p1' && newSquare.substr(1, 1) == '8')) {
        pieceLocations[newSquare] = 'q' + pieceLocations[newSquare].substr(1, 1);
    }

    // update images on chess board
    for (const square in pieceLocations) {
        if (pieceLocations[square] == '  ') {
            $('#' + square).children('.piece').first().attr("src", blankImage);
        } else {
            $('#' + square).children('.piece').first().attr("src", "images/pieces/" + pieceLocations[square] + ".png");
        }
    }

    // Append new move to moves string
    moves += oldSquare + newSquare + ";"

    // Append new board posistion to positions array
    var currentPosition = {};
    Object.assign(currentPosition, pieceLocations);
    positions.push(currentPosition);

    // Set turn to next player
    if (playerTurn == 1) {
        playerTurn = 2;
    } else if (playerTurn == 2) {
        playerTurn = 1;
    }

    // Test for checkmate and stalemate
    var kingLocation = findPiece("k" + playerTurn).substr(0, 2);

    if (kingInCheck(kingLocation, playerTurn, pieceLocations)) {

        var checkmate = true;
        
        // loop through all possible moves for all pieces
        // set checkmate variable to false if a valid move is found

        var squares = pieceSquares(playerTurn);

        for (const newSquare in pieceLocations) {
            squares.forEach(oldSquare => {
                if (isMoveValid(oldSquare, newSquare, false)) {
                    checkmate = false;
                    return;
                }
            });
        }

        // If there is a move that stops check, do nothing and continue with the game.
        // Otherwise, end the game.
        if (checkmate) {

            var action;
            setTimeout(() => {
                
                action = confirm("Checkmate - " + ((playerTurn == 1) ? "Black" : "White") + " won!\nDo you want to play again?");
                
                if (action == true) {
                    isGameActive = false;
                    StartGame();
                } else {
                    playerTurn = 0;
                    isGameActive = false;
                    $('#StartGame').text('Start Game');
                }

            }, 250);

        }

    } else {

        var stalemate = true;
        var squares = pieceSquares(playerTurn);

        for (const newSquare in pieceLocations) {
            squares.forEach(oldSquare => {
                if (isMoveValid(oldSquare, newSquare, false)) {
                    stalemate = false;
                    return;
                }
            });
        }

        if (stalemate) {

            var action;
            setTimeout(() => {
                
                action = confirm("Stalemate - " + ((playerTurn == 1) ? "White" : "Black") + " has no legal moves.\nDo you want to play again?");

                if (action == true) {
                    isGameActive = false;
                    StartGame();
                } else {
                    playerTurn = 0;
                    isGameActive = false;
                    $('#StartGame').text('Start Game');
                }
            
            }, 250);

        }
    }

    // Test for 50 move rule
    if (movesWithoutPawnOrCapture >= 100) {

        var action;
        setTimeout(() => {
            
            action = confirm("Draw by 50 Move Rule - 50 turns have been played without any pawn moves or captures.\nDo you want to play again?");

            if (action == true) {
                isGameActive = false;
                StartGame();
            } else {
                playerTurn = 0;
                isGameActive = false;
                $('#StartGame').text('Start Game');
            }
        
        }, 250);

    }

    // Test for threefold repetition
    var positionsCount = 0;
    positions.forEach(position => {

        var isEqual = true;

        for (const square in position) {
            if (position[square] != pieceLocations[square]) {
                isEqual = false;
            }
        }

        if (isEqual) {
            positionsCount += 1;
        }
    });

    if (positionsCount >= 3) {

        var action;
        setTimeout(() => {
            
            action = confirm("Draw by Threefold Repetition - This position has been repeated 3 times.\nDo you want to play again?");

            if (action == true) {
                isGameActive = false;
                StartGame();
            } else {
                playerTurn = 0;
                isGameActive = false;
                $('#StartGame').text('Start Game');
            }
        
        }, 250);

    }

    // test for insufficient material
    var whitePiecesValue = 0;
    var blackPiecesValue = 0;

    for (const square in pieceLocations) {
        var piece = pieceLocations[square];
        var pieceType = piece.substr(0, 1);
        var pieceColor = piece.substr(1, 1);

        if (pieceColor == '1') {

            if (pieceType == 'b' || pieceType == 'n') {
                whitePiecesValue += 1;
            } else if (pieceType != 'k') {
                whitePiecesValue += 2;
            }

        } else if (pieceColor == '2') {

            if (pieceType == 'b' || pieceType == 'n') {
                blackPiecesValue += 1;
            } else if (pieceType != 'k') {
                blackPiecesValue += 2;
            }

        }
    }

    if (whitePiecesValue < 2 && blackPiecesValue < 2) {

        var action;
        setTimeout(() => {
            
            action = confirm("Draw by Insufficient Material - There are not enough pieces on the board for either player to win.\nDo you want to play again?");

            if (action == true) {
                isGameActive = false;
                StartGame();
            } else {
                playerTurn = 0;
                isGameActive = false;
                $('#StartGame').text('Start Game');
            }
        
        }, 250);

    }

}

// Function runs when start game button is pressed.
function StartGame() {
    
    // Reset piece positions
    for (const square in pieceLocations) {

        pieceLocations[square] = startingPosition[square]

        if (pieceLocations[square] == '  ') {
            $('#' + square).children('.piece').first().attr("src", blankImage);
        } else {
            $('#' + square).children('.piece').first().attr("src", "images/pieces/" + pieceLocations[square] + ".png");
        }

    }

    playerTurn = 1; // Set turn to player 1 (white)
    isGameActive = true;
    moves = ""; // Clear past moves

    movesWithoutPawnOrCapture = 0;
    positions = [];

    $('#StartGame').text('Restart Game');
    
}

// Helper function that returns the square name(s) of a piece
function findPiece(pieceCode) {

    // Initialize list of square names to an empty string
    var squares = ""

    // Loop through all squares.
    for (const square in pieceLocations) {

        // Add square name to string of results if the square contains the piece.
        squares += (pieceLocations[square] == pieceCode) ? square + ";" : "";

    }

    // Return all squares with the specified piece to search for.
    return squares;

}

// Calculate horizontal distance between two squares
function CalculateXDistance(squareOne, squareTwo) {
    return columns.indexOf(squareTwo.substr(0, 1)) - columns.indexOf(squareOne.substr(0, 1));
}

// Calculate vertical distance between two squares
function CalculateYDistance(squareOne, squareTwo) {
    return parseInt(squareTwo.substr(1, 1)) - parseInt(squareOne.substr(1, 1));
}

// Return the first piece encountered in a line from the starting square
function checkPath(kingSquare, xIncrement, yIncrement) {

    if (xIncrement == 0 && yIncrement == 0) {
        return '  ';
    }

    var xPos = columns.indexOf(kingSquare.substr(0, 1));
    var yPos = parseInt(kingSquare.substr(1, 1));

    var square = '  ';

    do {

        xPos += xIncrement;
        yPos += yIncrement;

        if (xPos < 0 || xPos > 7 || yPos < 1 || yPos > 8) {
            return '  ';
        }

        square = columns[xPos].toString() + yPos.toString();

    } while (pieceLocations[square] == '  ');

    return pieceLocations[square];
}

// Determine if there is a piece between two squares
function checkPathBlocked(squareOne, squareTwo, includeSecondSquare) {

    var xDistance = CalculateXDistance(squareOne, squareTwo);
    var yDistance = CalculateYDistance(squareOne, squareTwo);

    if (Math.abs(xDistance) != Math.abs(xDistance) && xDistance != 0 && yDistance != 0) {
        return true;
    }
    
    var xPos = columns.indexOf(squareOne.substr(0, 1));
    var yPos = parseInt(squareOne.substr(1, 1));

    var xIncrement = (xDistance == 0) ? 0 : xDistance / Math.abs(xDistance);
    var yIncrement = (yDistance == 0) ? 0 : yDistance / Math.abs(yDistance);

    var square = squareOne;

    do {

        xPos += xIncrement;
        yPos += yIncrement;

        square = columns[xPos].toString() + yPos.toString();

        if (pieceLocations[square] != '  ') {
            if (square != squareTwo || includeSecondSquare) {
                return true
            }
        }

    } while (square != squareTwo);

    return false;
}

// returns true if the king is in check
function kingInCheck(kingLocation, playerColor, pieceLocations) {

    var testSquarePiece = '';
    var oppenentColor = (playerColor == 1) ? 2 : 1;

    // Check horizontal, vertical, and diagonal lines out from the king for hazardous pieces.
    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {

            testSquarePiece = checkPath(kingLocation, x, y);

            if (Math.abs(x + y) == 1) { // Straight path
                if (testSquarePiece == 'q' + oppenentColor.toString() || testSquarePiece == 'r' + oppenentColor.toString()) {
                    return true;
                }
            } else { // Diagonal path
                if (testSquarePiece == 'q' + oppenentColor.toString() || testSquarePiece == 'b' + oppenentColor.toString()) {
                    return true;
                }
            }

        }
    }

    // Check for pawn checks
    var xPos = columns.indexOf(kingLocation.substr(0, 1));
    var yPos = parseInt(kingLocation.substr(1, 1));

    var squareOne = (xPos < 7 && yPos != ((playerColor == 1) ? 8 : 1)) ? columns[xPos + 1].toString() + (yPos + ((playerColor == 1) ? 1 : -1)).toString() : '  ';
    var squareTwo = (xPos > 0 && yPos != ((playerColor == 1) ? 8 : 1)) ? columns[xPos - 1].toString() + (yPos + ((playerColor == 1) ? 1 : -1)).toString() : '  ';

    if (squareOne != '  ') {
        if (pieceLocations[squareOne] == 'p' + oppenentColor.toString()) {
            return true;
        }
    }
    if (squareTwo != '  ') {
        if (pieceLocations[squareTwo] == 'p' + oppenentColor.toString()) {
            return true;
        }
    }

    // Check for knight checks
    const xValues = [-2, -2, -1, -1, 1, 1, 2, 2];
    const yValues = [1, -1, 2, -2, 2, -2, 1, -1];
    
    for (var i = 0; i < 8; i++) {
        if (xPos + xValues[i] >= 0 && xPos + xValues[i] < 8 && yPos + yValues[i] > 0 && yPos + yValues[i] <= 8) {
            if (pieceLocations[columns[xPos + xValues[i]].toString() + (yPos + yValues[i]).toString()] == 'n' + oppenentColor.toString()) {
                return true;
            }
        }
    }

    // Check for opponent king
    var opponentKingLocation = findPiece("k" + oppenentColor).substr(0, 2);
    
    if (Math.abs(CalculateXDistance(kingLocation, opponentKingLocation)) <= 1 && Math.abs(CalculateYDistance(kingLocation, opponentKingLocation)) <= 1) {
        return true;
    }

    return false; // no checks found

}

// return the file (column) of a square
function getFile(square) {
    return square.substr(0, 1);
}

// return the rank (row) of a square
function getRank(square) {
    return parseInt(square.substr(1, 1));
}

// return the square at the given file and rank
function squareAt(file, rank) {
    return file.toString() + rank.toString();
}

// return all the squares of a certain color's pieces
function pieceSquares(playerNumber) {

    var squares = [];

    for (const square in pieceLocations) {
        if (pieceLocations[square].substr(1, 1) == playerNumber.toString()) {
            squares.push(square);
        }
    }

    return squares;
    
}