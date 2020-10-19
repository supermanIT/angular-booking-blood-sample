import db from '../models';

const Package = db.package;
const WorkingGroup = db.workingGroup;
const Appointment = db.appointment;
const PackageGroup = db.packageGroup;

exports.create = (req, res) => {
    const newPackage = {
        name: req.body.name,
        number: req.body.number,
        price: req.body.price,
        special_price: req.body.special_price,
        isActive: req.body.isActive,
        status: req.body.status,
        content: req.body.content
    };
    Package.create(newPackage).then(async data => {
        for (const groupId of req.body.group_id) {
            const newPackageGroup = {
                packageId: data.id,
                groupId: groupId
            };
            await PackageGroup.create(newPackageGroup)
        }
        res.status(201).json(data);
    }).catch(e => {
        res.status(400).send({
            message: e.errors[0].message || 'Some error occurred.'
        });
    });
};

exports.get = async (req, res) => {
    const allPackage = await Package.findAll({raw: true, nest: true});
    WorkingGroup.hasMany(PackageGroup, {foreignKey: 'groupId'});
    PackageGroup.belongsTo(WorkingGroup, {foreignKey: 'groupId'});
    const response = [];
    for (const packageOne of allPackage) {
        const working_groups = await PackageGroup.findAll({where: {packageId: packageOne.id}, include: [WorkingGroup], raw: true, nest: true});
        response.push({...packageOne, working_groups})
    }
    res.status(200).json(response);
}

exports.getWithQuery = async (req, res) => {
    WorkingGroup.hasMany(PackageGroup, {foreignKey: 'groupId'});
    PackageGroup.belongsTo(WorkingGroup, {foreignKey: 'groupId'});
    const allPackage = await Package.findAll({where: {status: req.query.status}, raw: true, nest: true});
    const response = [];
    for (const packageOne of allPackage) {
        const working_groups = await PackageGroup.findAll({where: {packageId: packageOne.id}, include: [WorkingGroup], raw: true, nest: true});
        response.push({...packageOne, working_groups})
    }
    res.status(200).json(response);
}

exports.delete = async (req, res) => {
    const appointment = await Appointment.findAll({where: {packageId: req.params.id}});
    if (appointment.length > 0) {
        res.status(400).json({error: 'Appointment has this package'})
        return;
    }
    Package.destroy({where: {id: req.params.id}}).then(() => {
        res.status(204).json({});
    })
}

exports.update = async (req, res) => {
    const data = {
        name: req.body.name,
        number: req.body.number,
        price: req.body.price,
        special_price: req.body.special_price,
        isActive: req.body.isActive,
        status: req.body.status,
        content: req.body.content
    };
    const id = req.params.id;

    Package.update(data, {returning: true, where: {id}}).then(async () => {
        WorkingGroup.hasMany(PackageGroup, {foreignKey: 'groupId'});
        PackageGroup.belongsTo(WorkingGroup, {foreignKey: 'groupId'});
        await PackageGroup.destroy({where: {packageId: id}});
        for (const groupId of req.body.group_id) {
            const newPackageGroup = {
                packageId: id,
                groupId: groupId
            };
            await PackageGroup.create(newPackageGroup)
        }
        Package.findByPk(id, {raw: true, nest: true}).then(async updatedPackage => {
            const working_groups = await PackageGroup.findAll({where: {packageId: updatedPackage.id}, include: [WorkingGroup], raw: true, nest: true});
            res.json({...updatedPackage, working_groups});
        });
    });
}