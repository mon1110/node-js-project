// // schedules/date.js
// const schedule = require('node-schedule');

// // Schedule Rule
// const rule = new schedule.RecurrenceRule();

// // Run daily at 2:30 PM
// rule.hour = 14;
// rule.minute = 30;

// // Timezone (Asia/Kolkata = IST)
// rule.tz = 'Asia/Kolkata';

// // Start date (from when job should begin)
// rule.start = new Date(2025, 6, 2); // July 2, 2025

// // End date (after which job should stop)
// rule.end = new Date(2025, 6, 5); // July 5, 2025

// console.log('Job scheduled from:', rule.start.toLocaleString(), 'to', rule.end.toLocaleString());

// schedule.scheduleJob(rule, () => {
//   console.log('✅ Scheduled Job Running at:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
// });

// schedules/date.js
const schedule = require('node-schedule');

// Start Date: July 2, 2025 at 2:30 PM IST
const startDate = new Date('2025-07-02T14:30:00+05:30');

//end date
const endDate = new Date('2025-07-05T14:30:00+05:30');

console.log('Job scheduled from:', startDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), 
            'to', endDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));

// Define recurrence rule to run daily at 2:30 PM
const rule = new schedule.RecurrenceRule();
rule.hour = 14;
rule.minute = new schedule.Range(0, 59, 10);
rule.tz = 'Asia/Kolkata'; // India timezone

// Schedule the job with start and end
schedule.scheduleJob({ start: startDate, end: endDate, rule }, () => {
  console.log('Scheduled Job Running at:', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
});
