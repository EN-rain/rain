import React from 'react';
import '../styles/page-one-half.css';

interface PageOneHalfProps {
  assetsPath: string;
  isAssembled?: boolean;
  onBack: () => void;
  onNext: () => void;
}

const layers = [
  { name: '02-spread.png', style: 'spread' },
  { name: '01-backing.png', style: 'backing' },
  { name: '04-black-card-square.png', style: 'black-card' },
  { name: '03-large-card.png', style: 'large-card' },
  { name: '06-paper.png', style: 'paper' },
  { name: '05-small-card.png', style: 'small-card' },
];

export const PageOneHalf: React.FC<PageOneHalfProps> = ({
  assetsPath,
  isAssembled = false,
  onBack,
  onNext,
}) => {
  return (
    <div
      className={`page-half ${isAssembled ? 'is-assembled' : 'is-scattered'}`}
      aria-label="Detective dossier"
    >
      <div className="page-half-layout">
        {layers.map(({ name, style }) => (
          <img
            key={name}
            src={`${assetsPath}/page-one-half/${name}`}
            alt=""
            className={`page-half-layer page-half-${style}`}
          />
        ))}
      </div>
      <nav className="page-half-controls" aria-label="Dossier navigation">
        <button type="button" onClick={onBack}>← Back to desk</button>
        <button type="button" onClick={onNext}>Scrapbook →</button>
      </nav>
    </div>
  );
};
