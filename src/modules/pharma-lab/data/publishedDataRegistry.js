import original from './publishedExperiments.json';
import remaining from './remainingPublishedExperiments.json';

export const remainingPublishedLabs = remaining;
export const publishedDataRegistry = { ...original, ...remaining };
