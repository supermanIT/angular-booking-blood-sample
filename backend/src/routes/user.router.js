import {Router} from 'express';
import * as userController from '../controllers/user.controller';

const router = Router();

router.route('/create').post(userController.create);
router.route('/patient/create').post(userController.createPatient);

router.route('/get').get(userController.get);
router.route('/getPatients').get(userController.getPatients);
router.route('/getPatientById/:id').get(userController.getPatientById);
router.route('/getWorkingGroup').get(userController.getAgAdminInWorkingGroup);
router.route('/unassignedInCalendar').get(userController.unassignedInCalendar);
router.route('/unassignedInAgency').get(userController.unassignedInAgency);
router.route('/getUser/:id').get(userController.getUserInfo);

router.route('/delete/:id').delete(userController.delete);
router.route('/update/:id').put(userController.update);
router.route('/updatePatientById/:id').put(userController.updatePatientById);

export default router;
