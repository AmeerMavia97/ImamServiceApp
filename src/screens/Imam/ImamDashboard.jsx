import ApprovalGate from '@/components/Sections/ApprovalGate';
import RoleGuard from '@/configuration/protection/RoleGuard';
import RoleTabNavigator from '@/configuration/navigation/RoleTabNavigator';
import { ROLES } from '@/constants/roles';

// Only an Imam account can open this screen, and only after the admin approved it.
export default function ImamDashboard() {
  return (
    <RoleGuard allow={ROLES.IMAM}>
      <ApprovalGate>
        <RoleTabNavigator />
      </ApprovalGate>
    </RoleGuard>
  );
}
