import db from '../models';
import {sendMail} from '../helper/email';

const MedicalQuestion = db.medicalQuestion;
const Appointment = db.appointment;
const ContactHistory = db.contactHistory;
const MedicalAnswer = db.medicalAnswer;
const sequelize = db.sequelize;

exports.sendMessageToPatient = async (req, res) => {
    // const newAnswerData = {
    //     questionId: req.body.questionId,
    //     answer: req.body.answer
    // };
    // const newAnswer = await MedicalAnswer.create(newAnswerData);
    // if (newAnswer) {
    // await Appointment.update({anamnesisStatus: 'closed'}, {where: {id: req.body.appointmentId}});
    // await ContactHistory.create({appointmentId: req.body.appointmentId, type: 'Doctor answered'});
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
    // }
    res.status(201).json({message: 'Email sent'});
}

exports.getContactHistory = async (req, res) => {
    const id = req.params.id;
    const appointment = await sequelize.query(`
        SELECT appointments.id AS id, appointments.time AS startTime,
            patients.street AS addressStreet, patients.plz AS addressPlz, patients.ort AS addressOrt,
            packages.name AS packageName,
            calendars.duration_appointment AS duration
        FROM appointments
        JOIN agencies ON appointments.agencyId=agencies.id
        JOIN working_group_agencies ON working_group_agencies.agencyId=agencies.id
        JOIN working_groups ON working_group_agencies.groupId=working_groups.id
        JOIN calendars ON working_groups.calendar_id=calendars.id
        JOIN users ON appointments.userId=users.id
        JOIN patients ON patients.user_id=users.id
        JOIN packages ON appointments.packageId=packages.id
        WHERE appointments.id=${id}
    `, {type: db.Sequelize.QueryTypes.SELECT});
    const contactHistory = await ContactHistory.findAll({where: {appointmentId: id}, raw: true, nest: true});
    const response = {
        appointment,
        contactHistory
    };
    res.status(200).json(response);
}

exports.cancelAppointment = async (req, res) => {
    const id = req.params.id;
    await Appointment.update({adminStatus: 'canceled'}, {where: {id}});
    await MedicalQuestion.update({isActive: false}, {where: {appointmentId: id}});
    const user = await sequelize.query(`
        SELECT users.email AS email, appointments.id AS appointmentId 
        FROM appointments 
        JOIN users ON appointments.userId=users.id
        WHERE appointments.id=${id}
    `, {type: db.Sequelize.QueryTypes.SELECT});
    console.log(user);
    if (user.length > 0) {
        const mailData = {
            email: user[0].email,
            subject: 'Appointment cancel',
            from: process.env.OWNER_EMAIL,
            content: 'Your questionnaire is not good.'
        };
        await sendMail(mailData);
    }
    res.status(200).json({message: 'Appointment cancel'});
}