import db from '../models';
import Sequelize from 'sequelize';

const Agency = db.agency;
const User = db.user;
const Appointment = db.appointment;

exports.create = (req, res) => {
    const newAgency = {
        name: req.body.name,
        doctors_id: JSON.stringify(req.body.doctors_id)
    };
    Agency.create(newAgency).then(async data => {
        res.status(201).json(data);
    }).catch(e => {
        res.status(400).send({
            message: e.errors[0].message || 'Some error occurred.'
        });
    });
};

exports.get = async (req, res) => {
    let query = '';
    if (req.params.adminId) {
        const userId = parseInt(req.params.adminId);
        const workingGroups = await db.workingGroup.findAll({raw: true});
        let value;
        for (const workingGroup of workingGroups) {
            const admins = JSON.parse(workingGroup.admin);
            if (admins.includes(userId)) {
                value = workingGroup;
                break;
            }
        }
        if (value) {
            query = `WHERE working_groups.id = ${value.id}`;
        }
    }
    const allAgency = await db.sequelize.query(`
    SELECT agencies.id AS id, agencies.name AS name, agencies.doctors_id AS doctors_id, working_groups.calendar_id AS calendar_id
    FROM agencies 
    JOIN working_group_agencies ON working_group_agencies.agencyId=agencies.id 
    JOIN working_groups ON working_group_agencies.groupId=working_groups.id ${query}`, {type: Sequelize.QueryTypes.SELECT, raw: true, nest: true});
    const response = [];
    for (const agency of allAgency) {
        let doctors;
        doctors = [];
        agency.doctors_id = JSON.parse(agency.doctors_id);
        for (const doctor_id of agency.doctors_id) {
            const doctor = await User.findByPk(doctor_id);
            doctors.push(doctor);
        }
        response.push({...agency, doctors});
    }
    res.status(200).json(response);
}

exports.getAll = async (req, res) => {
    const allAgency = await db.sequelize.query(`
    SELECT agencies.id AS id, agencies.name AS name, agencies.doctors_id AS doctors_id
    FROM agencies`, {type: Sequelize.QueryTypes.SELECT, raw: true, nest: true});
    const response = [];
    for (const agency of allAgency) {
        let doctors;
        doctors = [];
        agency.doctors_id = JSON.parse(agency.doctors_id);
        for (const doctor_id of agency.doctors_id) {
            const doctor = await User.findByPk(doctor_id);
            doctors.push(doctor);
        }
        response.push({...agency, doctors});
    }
    res.status(200).json(response);
}

exports.getAgencyInGroup = async (req, res) => {
    const allAgency = await db.sequelize.query(`SELECT * FROM agencies WHERE id NOT IN (SELECT agencyId FROM working_group_agencies)`, {type: Sequelize.QueryTypes.SELECT, raw: true, nest: true});
    res.status(200).json(allAgency);
}

exports.delete = async (req, res) => {
    const appointment = await Appointment.findAll({where: {agencyId: req.params.id}});
    if (appointment.length > 0) {
        res.status(400).json({error: 'Appointment has this agency'})
        return;
    }
    Agency.destroy({where: {id: req.params.id}}).then(() => {
        res.status(204).json({});
    });
}

exports.update = async (req, res) => {
    const data = req.body;
    data.doctors_id = JSON.stringify(data.doctors_id);
    const id = req.params.id;
    Agency.update(data, {returning: true, where: {id}}).then(async () => {
        Agency.findByPk(id, {raw: true}).then(async updatedAgency => {
            let doctors = [];
            updatedAgency.doctors_id = JSON.parse(updatedAgency.doctors_id);
            for (const doctor_id of updatedAgency.doctors_id) {
                const doctor = await User.findByPk(doctor_id);
                doctors.push(doctor);
            }
            res.status(200).json({...updatedAgency, doctors});
        });
    });
}
