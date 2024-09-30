


                export function LoadingComp() {

                    return(
                        <div className="grid h-screen place-content-center bg-white px-4">
                        <div className="text-center">
                          <h1 className="text-9xl font-black text-gray-500">
                            Loading
                            <span className="dots">
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                              <span className="dot">.</span>
                            </span>
                          </h1>
                        </div>
                        <style jsx>{`
                          @keyframes blink {
                            0% { opacity: 0.2; }
                            20% { opacity: 1; }
                            100% { opacity: 0.2; }
                          }
                          
                          .dots .dot {
                            animation: blink 1.4s infinite both;
                            animation-delay: 0s;
                          }
                          
                          .dots .dot:nth-child(2) {
                            animation-delay: 0.2s;
                          }
                          
                          .dots .dot:nth-child(3) {
                            animation-delay: 0.4s;
                          }
                        `}</style>
                      </div>
                        
                    )

                }