param([string]$Reference,[string]$Actual,[string]$OutputBase)
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
public static class TargetImageComparison {
  public static double[] Compare(Bitmap a, Bitmap b, Bitmap overlay, Bitmap difference) {
    double error=0, ssim=0; int tiles=0;
    for(int ty=0;ty<a.Height;ty+=8) for(int tx=0;tx<a.Width;tx+=8) {
      double sx=0,sy=0,sxx=0,syy=0,sxy=0; int count=0;
      for(int y=ty;y<Math.Min(ty+8,a.Height);y++) for(int x=tx;x<Math.Min(tx+8,a.Width);x++) {
        Color p=a.GetPixel(x,y),q=b.GetPixel(x,y);
        int dr=Math.Abs(p.R-q.R),dg=Math.Abs(p.G-q.G),db=Math.Abs(p.B-q.B);
        error+=dr+dg+db;
        overlay.SetPixel(x,y,Color.FromArgb(255,(p.R+q.R)/2,(p.G+q.G)/2,(p.B+q.B)/2));
        difference.SetPixel(x,y,Color.FromArgb(255,Math.Min(255,dr*3),Math.Min(255,dg*3),Math.Min(255,db*3)));
        double u=.2126*p.R+.7152*p.G+.0722*p.B,v=.2126*q.R+.7152*q.G+.0722*q.B;
        sx+=u;sy+=v;sxx+=u*u;syy+=v*v;sxy+=u*v;count++;
      }
      double mx=sx/count,my=sy/count,vx=Math.Max(0,sxx/count-mx*mx),vy=Math.Max(0,syy/count-my*my),cov=sxy/count-mx*my;
      ssim+=((2*mx*my+6.5025)*(2*cov+58.5225))/((mx*mx+my*my+6.5025)*(vx+vy+58.5225));tiles++;
    }
    return new double[]{error/(a.Width*a.Height*3.0),ssim/tiles};
  }
}
'@
$referenceBitmap=[System.Drawing.Bitmap]::new($Reference)
$actualBitmap=[System.Drawing.Bitmap]::new($Actual)
try {
  if($referenceBitmap.Size -ne $actualBitmap.Size){throw 'Comparison requires identical image dimensions.'}
  $overlay=[System.Drawing.Bitmap]::new($referenceBitmap.Width,$referenceBitmap.Height)
  $difference=[System.Drawing.Bitmap]::new($referenceBitmap.Width,$referenceBitmap.Height)
  $scores=[TargetImageComparison]::Compare($referenceBitmap,$actualBitmap,$overlay,$difference)
  $overlay.Save($OutputBase+'-overlay.png',[System.Drawing.Imaging.ImageFormat]::Png)
  $difference.Save($OutputBase+'-difference.png',[System.Drawing.Imaging.ImageFormat]::Png)
  $report=[pscustomobject]@{Width=$referenceBitmap.Width;Height=$referenceBitmap.Height;MeanAbsoluteChannelError=$scores[0];BlockLuminanceSSIM=$scores[1];Method='Equal-weight 8x8 tiles, population variance, Rec.709 luma, C1=6.5025, C2=58.5225';Note='Diagnostic metrics, not proof of a percent visual match. Inspect layout, silhouettes and educational correctness separately.'}|ConvertTo-Json
  $report | Set-Content -LiteralPath ($OutputBase+'-metrics.json')
  $report
  $overlay.Dispose();$difference.Dispose()
} finally {$referenceBitmap.Dispose();$actualBitmap.Dispose()}
