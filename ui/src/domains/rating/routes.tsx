import { Routes, Route } from 'react-router-dom'
import RatingApp from './RatingApp'

// Note: RatingApp contains its own internal routing for keywords/dashboard
export const QualificationRoutes = () => (
    <Routes>
        <Route path="*" element={<RatingApp />} />
    </Routes>
)
