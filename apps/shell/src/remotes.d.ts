declare module 'mf1Detail/PokemonDetail' {
  import type { ComponentType } from 'react';
  const PokemonDetail: ComponentType<{
    name: string;
    onNavigate?: (name: string) => void;
    onGoHome?: () => void;
  }>;
  export default PokemonDetail;
}

declare module 'mf2History/History' {
  import type { ComponentType } from 'react';
  const History: ComponentType;
  export default History;
}
