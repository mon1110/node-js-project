const cron = require('node-cron');
const { sendWelcomeMailsToAllUsers } = require('../Service/userService');
function logMessage() {
    console.log('Cron job executed at:', new Date().toLocaleString());
}


// Schedule to run every minute
cron.schedule('* * * * *', async () => {
    logMessage()
    await sendWelcomeMailsToAllUsers();
});

//run every day at 10:00 AM
cron.schedule('0 10 * * *', () => {
    logMessage();

});

//run every monday at 12 am
cron.schedule('0 12 * * monday', () => {
    logMessage();
});

//Every minute, only on Tuesday, only in July
cron.schedule('* * * 7 2', () => {
    logMessage();
});

//today at 04 o'clock
cron.schedule('01 4 * * *', async () => {
    logMessage()
    await sendWelcomeMailsToAllUsers();
});
