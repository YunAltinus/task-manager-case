const { taskQueue } = require("../queues/task-queue");

taskQueue.process(async (job) => {
  const { title, deadline } = job.data;

  console.log(
    `[MAIL SENT]: Task "${title}" is nearing its deadline: ${deadline}`
  );
});