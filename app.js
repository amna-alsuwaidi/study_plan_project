const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const port = 8080;

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/', function (req, res) {
    console.log(req.body);

    const { subject, examDate, studyHoursPerDay, difficulty } = req.body;
    const errors = [];

    // Validation
    if (!subject || typeof subject !== 'string') {
        errors.push("Invalid subject");
    }

    if (!examDate || isNaN(Date.parse(examDate))) {
        errors.push("Invalid exam date");
    }

    if (typeof studyHoursPerDay !== 'number' || studyHoursPerDay <= 0) {
        errors.push("Study hours per day must be a positive number");
    }

    if (!['Low', 'Medium', 'High'].includes(difficulty)) {
        errors.push("Difficulty must be Low, Medium, or High");
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Date calculations
    const today = new Date();
    const exam = new Date(examDate);
    const timeDiff = exam.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft <= 0) {
        return res.status(400).json({ errors: ["Exam date must be in the future"] });
    }

    // Estimated required hours based on difficulty
    const difficultyHours = {
        'Low': 5,
        'Medium': 10,
        'High': 15
    };
    const requiredHours = difficultyHours[difficulty];
    const availableHours = daysLeft * studyHoursPerDay;

    const readiness = Math.min((availableHours / requiredHours) * 100, 100);

    const studyPlan = {
        subject,
        daysLeft,
        requiredHours,
        availableHours,
        readiness: Math.round(readiness),
        message: readiness >= 90 ? "You're well prepared!" :
            readiness >= 60 ? "You're on track." :
                "You may need to increase your study time."
    };

    res.json(studyPlan);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Study Planner app listening on port ${port}`);
});
