export function _generateUniqueCustomId() {
    let str = 'abcdeABCDEFGHIJKfghijklmnopqrstuvwxyzLMNOPQRSTUVWXYZ0123456789';
    let char = '',
        genID = '';

    while(genID.length < 8) {
        char = new Date().getSeconds()+str.charAt(Math.floor(Math.random() * str.length));
        genID += char;
    }
    return genID;
}
export function _formatTimeMMSS(seconds) {
    const minutes = Math.floor(seconds / 60); // Get minutes
    const remainingSeconds = seconds % 60; // Get remaining seconds

    // Return formatted time as an array [minuteTens, minuteOnes, ":", secondTens, secondOnes]
    return [
        String(Math.floor(minutes / 10)),    // Tens place of minutes
        String(minutes % 10),                // Ones place of minutes
        ":",                                 // Separator
        String(Math.floor(remainingSeconds / 10)), // Tens place of seconds
        String(remainingSeconds % 10)         // Ones place of seconds
    ];
}
