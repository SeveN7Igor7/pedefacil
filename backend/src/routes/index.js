import { Router } from 'express';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import tableRoutes from './table.routes.js';
import customerRoutes from './customer.routes.js';
import whatsappRoutes from './whatsapp.routes.js';
import chatRoutes from './chat.routes.js';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/tables', tableRoutes);
router.use('/customers', customerRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/chat', chatRoutes);

export default router;

