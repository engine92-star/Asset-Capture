import { RegistryList } from '@/components/RegistryList';
import { Screen, Subtitle, Title } from '@/components/ui';
import { useRegistry } from '@/context/RegistryContext';

export default function LiabilitiesScreen() {
  const { items } = useRegistry();
  const liabilities = items.filter((item) => item.type === 'liability');

  return (
    <Screen>
      <Title>Liabilities</Title>
      <Subtitle>
        Track obligations, financing, leases, and recurring costs associated with your locations and
        equipment.
      </Subtitle>
      <RegistryList
        items={liabilities}
        emptyTitle="No liabilities captured yet"
        emptySubtitle="Liabilities detected during scans can be logged with annual cost documentation."
      />
    </Screen>
  );
}