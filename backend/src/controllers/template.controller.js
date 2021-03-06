import db from '../models';

const Template = db.template;
const TemplateAction = db.templateAction;
const TemplateKeyword = db.templatekeyword;

exports.create = async (req, res) => {
    const newTemplate = req.body;
    const templates = await Template.findAll({where: {assign: newTemplate.assign}});
    if (templates.length > 0) {
        res.status(400).json({message: 'Template was duplicated.'});
        return;
    }
    Template.create(newTemplate).then(data => {
        res.send(data);
    }).catch(err => {
        res.status(400).send({
            message: err.errors[0].message || 'Some error occurred.'
        })
    })
};

exports.get = async (req, res) => {
    const allTemplate = await Template.findAll({where: {}});
    res.status(200).json(allTemplate);
}

exports.delete = async (req, res) => {
    Template.destroy({where: {id: req.params.id}}).then(result => {
        res.status(204).json({});
    })
}

exports.update = async (req, res) => {
    const data = req.body;
    const id = req.params.id;
    const templates = await Template.findAll({where: {assign: data.assign}, raw: true, nest: true});
    for (const template of templates) {
        if (template.id.toString() !== id) {
            res.status(400).json({message: 'Template was duplicated.'});
            return;
        }
    }
    Template.update(data, {returning: true, where: {id}}).then((rowsUpdated) => {
        res.json(rowsUpdated);
    });
}

exports.getWithQuery = async (req, res) => {
    const templates = await Template.findAll({where: req.query});
    res.status(200).json(templates);
}

exports.getActions = async (req, res) => {
    const allActions = await TemplateAction.findAll({raw: true});
    res.status(200).json(allActions);
}

exports.getKeywords = async (req, res) => {
    const allKeywords = await TemplateKeyword.findAll({raw: true});
    res.status(200).json(allKeywords);
}
