import {Router} from 'express';
import * as districtController from '../controllers/district.controller';

const router = Router();

router.route('/create').post(districtController.create);
router.route('/get').get(districtController.get);
router.route('/delete/:id').delete(districtController.delete);
router.route('/update/:id').put(districtController.update);

export default router;