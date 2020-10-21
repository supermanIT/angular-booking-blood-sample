import db from '../models';
import {sendMail} from '../helper/email';

const MedicalQuestion = db.medicalQuestion;
const Appointment = db.appointment;
const ContactHistory = db.contactHistory;
const MedicalAnswer = db.medicalAnswer;
const sequelize = db.sequelize;

exports.createMedicalAnswer = async (req, res) => {
    const newAnswerData = {
        questionId: req.body.questionId,
        answer: req.body.answer
    };
    const newAnswer = await MedicalAnswer.create(newAnswerData);
    if (newAnswer) {
        await Appointment.update({anamnesisStatus: 'closed'}, {where: {id: req.body.appointmentId}});
        await ContactHistory.create({appointmentId: req.body.appointmentId, type: 'Doctor answered'});
        const user = await sequelize.query(`
        SELECT users.email AS email
        FROM medical_questions 
        JOIN appointments ON appointments.id=medical_questions.appointmentId
        JOIN users ON appointments.userId=users.id
        WHERE medical_questions.id=${req.body.questionId}
        `, {type: db.Sequelize.QueryTypes.SELECT});
        if (user[0]) {
            const mailData = {
                email: user[0].email,
                subject: 'Doctor Answer',
                from: process.env.OWNER_EMAIL,
                content: req.body.answer
            }
            await sendMail(mailData);
        }
    }
    res.status(201).json(newAnswer);
}
