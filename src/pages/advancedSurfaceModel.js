// Illustrative two-coordinate double well, not a fitted molecular force field.
export function surfaceEnergy(x,y,barrier=40,confinement=25){return barrier*(x*x-1)**2+confinement*y*y;}
export function surfaceGradient(x,y,barrier=40,confinement=25){return [4*barrier*x*(x*x-1),2*confinement*y];}
