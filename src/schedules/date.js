const schedule = require('node-schedule');

// Start Date (10 sec from now)
const startDate = new Date(Date.now() + 10 * 1000);
const endDate = new Date(startDate.getTime() + 10 * 60 * 1000); // 10-minute total window

console.log('Job Scheduled from:',startDate.toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }),
  'to', endDate.toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })
);

const cronExpression = '* * * * *';
let mainJob;

// MAIN JOB FUNCTION
function startMainJob(fromTime, toTime) {
  mainJob = schedule.scheduleJob({start: fromTime,end: toTime,rule: cronExpression,tz: 'Asia/Kathmandu'},
   () => {
    const now = new Date();
    console.log('\nJob Running...');
    console.log('Kathmandu Time:', now.toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));
    console.log('Kolkata Time  :', now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
  });
}

//RESCHEDULE FUNCTION
function rescheduleMainJob(newStartTime) {
  const updatedRule = {start: newStartTime,end: endDate,rule: cronExpression,tz: 'Asia/Kathmandu'};
  const result = mainJob.reschedule(updatedRule);
  console.log(result ? ' mainJob successfully rescheduled!': ' Failed to reschedule mainJob');
}

//Initial Start
startMainJob(startDate, endDate);

// Minute Counter Logic
let minuteCount = 0;
const maxMinutes = 3;

schedule.scheduleJob(startDate, () => {
  console.log(' Minute Counter Started at:',new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));

  const minuteJob = schedule.scheduleJob('*/1 * * * *', () => {
    minuteCount++;
    console.log(`Minute Passed Count: ${minuteCount} — at`,
      new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));

    if (minuteCount >= maxMinutes) {
      // Stop both jobs
      minuteJob.cancel();
      if (mainJob) {
        mainJob.cancel();
        console.log('\n mainJob stopped at:',
          new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));
      }
      console.log(' Cron Job Cancelled after 3 minutes');

      // Schedule resume after 5 minutes from STOP point
      const now = new Date();
      const resumeTime = new Date(now.getTime() + 5 * 60 * 1000);
      console.log(' mainJob will resume at:',
        resumeTime.toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));

      // Use scheduleJob to delay reschedule without setTimeout
      schedule.scheduleJob(resumeTime, () => {
        console.log('\nRestarting mainJob at:',
          new Date().toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' }));
        rescheduleMainJob(resumeTime);
      });
    }
  });
});
