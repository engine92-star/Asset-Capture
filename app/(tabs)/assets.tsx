import { RegistryList } from '@/components/RegistryList';
import { Screen, Subtitle, Title } from '@/components/ui';
import { useRegistry } from '@/context/RegistryContext';

export default function AssetsScreen() {
  const { items } = useRegistry();
  const assets = items.filter((item) => item.type === 'asset');

  return (
    <Screen>
      <Title>Assets</Title>
      <Subtitle>
        Tangible and intangible resources that meet your capitalization threshold and provide future
        economic benefit.
      </Subtitle>
      <RegistryList
        items={assets}
        emptyTitle="No assets captured yet"
        emptySubtitle="Use Scan mode while walking your location to identify and register high-value assets."
      />
    </Screen>
  );
}