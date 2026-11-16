import ApprovalGate from '@/components/Sections/ApprovalGate';
import RoleGuard from '@/configuration/protection/RoleGuard';
import RoleTabNavigator from '@/configuration/navigation/RoleTabNavigator';
import { ROLES } from '@/constants/roles';

// Only a Masjid Representative account can open this screen, and only after the admin approved it.
export default function MasjidDashboard() {
  return (
    <RoleGuard allow={ROLES.MASJID}>
      <ApprovalGate>
        <RoleTabNavigator />
      </ApprovalGate>
    </RoleGuard>
  );
}
