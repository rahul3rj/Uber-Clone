import React, { useState, useEffect } from 'react'
import BottomSlider from '../components/BottomSlider';

const RideSelection = () => {
    const [sliderOpen, setSliderOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [sliderStage, setSliderStage] = useState('ride');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const LOADING_DURATION_MS = 10000;
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentOpen, setPaymentOpen] = useState(false);
    const paymentIcons = {
      cash: "https://tb-static.uber.com/prod/wallet/icons_v2/cash_3x.png",
      upi: "https://tb-static.uber.com/prod/wallet/icons_v2/qr_3x.png",
      others: "https://tb-static.uber.com/prod/wallet/icons_v2/gift_box_3x.png",
    };
    const paymentLabelMap = { cash: "Cash", upi: "UPI", others: "Others" };
    const rideImages = [
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png",
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png",
      "https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Hatchback.png",
    ];
    const selectedImageSrc = selected !== null ? rideImages[selected] : "";

    useEffect(() => {
      if (sliderStage === 'loading') {
        const id = setTimeout(() => setSliderStage('details'), LOADING_DURATION_MS);
        return () => clearTimeout(id);
      }
    }, [sliderStage]);

    useEffect(() => {
      if (sliderStage === 'loading') {
        setLoadingProgress(0);
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const pct = Math.min(100, (elapsed / LOADING_DURATION_MS) * 100);
          setLoadingProgress(pct);
          if (pct >= 100) {
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      } else if (sliderStage === 'details') {
        setLoadingProgress(100);
      } else {
        setLoadingProgress(0);
      }
    }, [sliderStage]);
  return (
    <div className="h-screen w-full flex items-center justify-center overflow-hidden uber-move">
      <div className="h-screen w-full flex flex-col items-center justify-start relative">
        <div className="h-[70vh] w-full bg-white">
          <img
            src="/bg-map.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="shadow-md h-[5vh] w-[5vh] rounded-full absolute top-10 right-10 cursor-pointer">
          <div className="h-[5vh] w-[5vh] rounded-full bg-black flex items-center justify-center overflow-hidden border border-white border-2 ">
            <img
              src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg"
              alt=""
              className="h-full w-full object-cover "
            />
          </div>
        </div>
        <div
          onClick={() => {
            window.location.href = "/Home";
          }}
          className="h-[5vh] w-[5vh] rounded-full bg-white absolute top-10 left-7 flex items-center justify-center shadow-md hover:shadow-xl transition-all ease-in-out cursor-pointer"
        >
          <i className="ri-arrow-left-line text-xl font-bold"></i>
        </div>
        <div className="h-[30vh] w-full">
          <BottomSlider
            collapsedPeek={290}
            onOpenChange={(open) => {
              setSliderOpen(open);
            }}
          >
            {sliderStage === "ride" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start">
                <h1 className="text-lg uber-text-medium my-2">Choose a Ride</h1>
                <div className="w-full h-[2px] bg-black/10"></div>
                <div className="h-full w-full flex flex-col items-center justify-start my-2 gap-3">
                  <div
                    onClick={() => setSelected(0)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 0 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/Uber_Moto_India1.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Bike{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>1{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        8:00 AM . 3 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">₹80.99</h1>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelected(1)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 1 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/v1.1/TukTuk_Green_v1.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Auto{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>2{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        8:00 AM . 3 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">₹112.99</h1>
                    </div>
                  </div>
                  <div
                    onClick={() => setSelected(2)}
                    className={`h-[9vh] w-full rounded-lg border-2 flex items-center justify-between pr-4 cursor-pointer transition-all ease-in-out hover:bg-zinc-100 ${
                      selected === 2 ? "border-black" : "border-transparent"
                    }`}
                  >
                    <div className="h-full w-[9vh]">
                      <img
                        src="https://d1a3f4spazzrp4.cloudfront.net/car-types/haloProductImages/Hatchback.png"
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    </div>
                    <div className="h-[5vh] flex-1">
                      <h1 className="text-md uber-text-medium flex">
                        Uber Go{" "}
                        <span className="uber-text-medium font-[200] text-sm">
                          <i className="ml-1 ri-user-fill text-sm"></i>3{" "}
                        </span>
                      </h1>
                      <p className="text-sm uber-text text-zinc-500">
                        8:00 AM . 3 min
                      </p>
                    </div>
                    <div className="h-[5vh] flex-initial items-center justify-center">
                      <h1 className="text-md uber-text-medium">₹80.99</h1>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sliderStage === "loading" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start px-5">
                <h1 className="text-lg uber-move-bold mt-1">Ride requested</h1>
                <p className="text-sm uber-text text-zinc-500">
                  Finding drivers nearby
                </p>
                <div className="w-full h-1 bg-black/10 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <div className="w-full h-[8vh] flex items-center rounded-lg justify-between border-2 border-zinc-100 mt-5 px-3">
                  <div className="w-full flex-1 flex-col items-start justify-start">
                    <p className="text-xs uber-text text-zinc-500 font-[600]">
                      Trip Details
                    </p>
                    <h1 className="text-sm uber-text-medium">
                      Meet at the pickup point
                    </h1>
                  </div>
                  <div className="w-[5vh] h-[5vh] flex items-center justify-center bg-zinc-100 rounded-md cursor-pointer">
                    <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                  </div>
                </div>
                <div className="h-[20vh] w-full flex items-center justify-center mt-2 rounded-lg overflow-hidden">
                  <img
                    src="https://i.pinimg.com/originals/0c/a9/a9/0ca9a912149840edebd299271e8fbc56.gif"
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {sliderStage === "details" && (
              <div className="h-[50vh] w-full flex flex-col items-center justify-start px-5">
                <h1 className="text-lg uber-text-medium my-2">
                  Pick-up in 3 min
                </h1>
                <div className="h-[5vh] w-full bg-blue-500 rounded-md flex items-center justify-between px-5">
                  <h1 className="text-sm uber-text-medium text-white">
                    Share PIN
                  </h1>
                  <div className="h-[3vh] w-[30vw] flex items-center justify-between">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">1</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">2</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">3</h1>
                    </div>
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center bg-blue-900 rounded-md">
                      <h1 className="text-sm uber-text-medium text-white">4</h1>
                    </div>
                  </div>
                </div>
                <div className="w-full flex flex-col items-center justify-start my-3 gap-3">
                  <div className="w-full h-[8vh] flex items-center rounded-lg justify-between border-2 border-zinc-100 px-3">
                  <div className="w-full flex-1 flex-col items-start justify-start">
                    <p className="text-xs uber-text text-zinc-500 font-[600]">
                      Trip Details
                    </p>
                    <h1 className="text-sm uber-text-medium">
                      Meet at the pickup point
                    </h1>
                  </div>
                  <div className="w-[5vh] h-[5vh] flex items-center justify-center bg-zinc-100 rounded-md cursor-pointer">
                    <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                  </div>
                </div>
                </div>
                <div className='w-full h-[16vh] flex flex-col items-center rounded-lg justify-between border-2 border-zinc-100 px-3'>
                  <div className='w-full h-[60%] flex flex-col items-center justify-start'>
                    <div className='h-[70%] w-full flex items-center justify-between'>
                      <div className='h-full w-[20vw] flex items-center justify-start relative overflow-hidden pt-1'>
                        <div className='h-[5vh] w-[5vh] flex items-center justify-center relative z-20'>
                          <img src="https://i.pinimg.com/1200x/9d/16/4e/9d164e4e074d11ce4de0a508914537a8.jpg" alt=""  className='h-full w-full object-cover rounded-full border-1 border-black'/>
                          <div className='h-[1.5vh] w-[4vh] absolute -bottom-1 right-[.5vh] bg-black rounded-full flex items-center justify-center'>
                            <i className="ri-star-s-line text-white text-xs"></i>
                            <h1 className="text-[10px] uber-text-medium text-white">4.5</h1>
                          </div>
                        </div>
                        <div className='h-[8vh] w-[8vh] flex items-center justify-center absolute left-5 z-10'>
                          <img src={selectedImageSrc} alt="" className='h-full w-full object-cover' />
                        </div>
                      </div>
                      <div className='h-full w-[50vw] flex flex-col items-end justify-center'>
                        <h1 className="text-md uber-move-bold">
                          RJ14XS7777
                        </h1>
                        <p className="text-xs uber-text text-zinc-600 font-[600]">
                          Grey SUV
                        </p>
                      </div>
                    </div>
                    <div className='h-[2vh] w-full flex items-center justify-between'>
                      <p className="text-xs uber-text text-zinc-600 font-[600]">
                        Ajay Kumar
                      </p>
                      <p className="text-xs uber-text text-zinc-600 font-[600]">
                        500 Trips
                      </p>
                    </div>
                  </div>
                  <div className='w-full h-[40%] flex items-center justify-between'>
                    <div className='h-[5vh] w-[30vh] flex items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-message-fill text-black"></i>
                      <h1 className="text-sm uber-text-medium text-black">
                        Send a message
                      </h1>
                    </div>
                    <div className='h-[5vh] w-[5vh] flex items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-phone-fill text-black"></i>
                    </div>
                    <div className='h-[5vh] w-[5vh] flex items-center justify-center gap-2 rounded-md bg-zinc-100 cursor-pointer'>
                      <i className="ri-more-2-fill text-2xl text-black/50 rotate-90"></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </BottomSlider>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[13vh] bg-white w-full flex flex-col items-center justify-center border-t-[2px] border-t-black/10">
          <div onClick={() => setPaymentOpen(true)} className="h-[8vh] w-[80%] flex items-center justify-center cursor-pointer group">
            <div className="h-[3vh] w-[3vh] flex items-center justify-center">
              <img
                src={paymentIcons[paymentMethod]}
                alt={paymentLabelMap[paymentMethod]}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="h-[3vh] w-full flex-1 flex items-center justify-between mx-3">
              <h1 className="text-sm uber-text-medium">{paymentLabelMap[paymentMethod]}</h1>
              <i className="ri-arrow-drop-right-line text-3xl text-black/50 group-hover:text-black transition-all ease-in-out duration-200"></i>
            </div>
          </div>
          <button
            onClick={() => setSliderStage("loading")}
            className="w-[80%] h-[7vh] mb-2 rounded-md bg-black text-white text-md hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
          >
            {sliderStage === 'details' ? 'Request another ride' : 'Confirm Ride'}
          </button>

          {paymentOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" onClick={() => setPaymentOpen(false)}></div>
              <div className="relative z-[70] w-[80%] max-w-md bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-md uber-text-medium mb-2">Choose Payment Method</h2>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setPaymentMethod('cash'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.cash} alt="Cash" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">Cash</span>
                  </button>
                  <button onClick={() => { setPaymentMethod('upi'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.upi} alt="UPI" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">UPI</span>
                  </button>
                  <button onClick={() => { setPaymentMethod('others'); setPaymentOpen(false); }} className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-100 cursor-pointer">
                    <div className="h-[3vh] w-[3vh] flex items-center justify-center">
                      <img src={paymentIcons.others} alt="Others" className="h-full w-full object-cover" />
                    </div>
                    <span className="uber-text-medium">Others</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RideSelection