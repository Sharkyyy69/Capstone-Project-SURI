import { useEffect, useRef, useState } from 'react';
import BackButton from '../components/BackButton';

export default function ScannerPage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState('');
  const [productType, setProductType] = useState('fruit');
  const [itemName, setItemName] = useState('Mango');
  const [reportCreated, setReportCreated] = useState(false);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  useEffect(() => stopCamera, []);

  const requestCamera = async () => {
    setErrorMessage('');
    setCameraState('requesting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('unsupported');
      setErrorMessage('Camera access is not supported by this browser. Try a current browser or open the app over HTTPS.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('granted');
    } catch (error) {
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraState('denied');
        setErrorMessage('Camera permission was denied. Allow camera access in your browser settings, then try again.');
      } else if (error?.name === 'NotFoundError') {
        setCameraState('error');
        setErrorMessage('No camera was found on this device.');
      } else {
        setCameraState('error');
        setErrorMessage('The camera could not be opened. Check that it is available and not being used by another app.');
      }
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.9));
    setReportCreated(true);
    stopCamera();
  };

  const retakeImage = async () => {
    setCapturedImage('');
    setReportCreated(false);
    await requestCamera();
  };

  const itemOptions = productType === 'meat'
    ? ['Beef', 'Pork']
    : ['Mango', 'Banana', 'Apple', 'Orange', 'Other fruit'];

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setProductType(type);
    setItemName(type === 'meat' ? 'Beef' : 'Mango');
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">SURI Scan</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Scan meat or fruit</h1>
          </div>
          <BackButton />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.75fr]">
          <section className="card p-4 sm:p-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured product" className="h-full w-full object-contain" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className={`h-full w-full object-cover ${cameraState === 'granted' ? 'block' : 'hidden'}`}
                  />
                  {cameraState !== 'granted' && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <div className="max-w-sm">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-3xl">
                          <span aria-hidden="true">◎</span>
                        </div>
                        <h2 className="mt-5 text-xl font-semibold text-white">
                          {cameraState === 'idle' ? 'Ready to scan' : 'Camera unavailable'}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          {cameraState === 'idle'
                            ? 'Tap below to grant camera permission. Your camera will only turn on after you approve.'
                            : errorMessage || 'Please check your camera settings and try again.'}
                        </p>
                        {cameraState !== 'requesting' && (
                          <button type="button" onClick={requestCamera} className="btn-primary mt-5">
                            {cameraState === 'idle' ? 'Enable camera' : 'Try again'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {cameraState === 'granted' && (
                    <div className="pointer-events-none absolute inset-6 rounded-3xl border-2 border-white/80" />
                  )}
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                {cameraState === 'granted' && !capturedImage
                  ? 'Center the product inside the frame.'
                  : capturedImage
                    ? 'Photo captured successfully.'
                    : 'Camera permission is requested only when you enable it.'}
              </p>

              {capturedImage ? (
                <button type="button" onClick={retakeImage} className="btn-secondary">Retake photo</button>
              ) : cameraState === 'granted' ? (
                <button type="button" onClick={captureImage} className="btn-primary px-8">Capture & scan</button>
              ) : null}
            </div>

            {errorMessage && cameraState !== 'idle' && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-slate-900">Scan details</h2>
              <div className="mt-5 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Product type
                  <select value={productType} onChange={handleTypeChange} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500">
                    <option value="fruit">Fruit</option>
                    <option value="meat">Meat</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Selected item
                  <select value={itemName} onChange={(event) => setItemName(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none focus:border-emerald-500">
                    {itemOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">System report</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {reportCreated ? 'Captured' : 'Not started'}
                </span>
              </div>

              {reportCreated ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Analysis status</p>
                    <p className="mt-1 text-lg font-bold text-amber-900">Awaiting AI analysis</p>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <dt className="text-slate-500">Category</dt>
                      <dd className="font-semibold capitalize text-slate-900">{productType}</dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                      <dt className="text-slate-500">Item</dt>
                      <dd className="font-semibold text-slate-900">{itemName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Freshness score</dt>
                      <dd className="font-semibold text-slate-900">Pending</dd>
                    </div>
                  </dl>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">Recommendation</p>
                    <p className="mt-1">No recommendation yet — AI assessment has not been connected.</p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Capture a photo to create the report foundation.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
