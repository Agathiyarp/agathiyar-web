import React from "react";
// import "./Footer.css";
const Footer = () => {
  return (
      <div class="container my-5">
        <footer class="text-white text-center text-lg-start bg-dark">
          <div class="container p-4">
            <div class="row mt-4">
              <div class="col-lg-4 col-md-12 mb-4 mb-md-0">
                <h5 class="text-uppercase mb-4">About company</h5>

                <p>
                  Experience peace and tranquility at the Agathiyar Pyramid
                  Dhyana Ashram, a sanctuary for meditation and spiritual
                  growth.
                </p>
                <h1>Agathiyar Pyramid Dhyana Ashram</h1>
                <p className="address">
                  Near Ramanaickenpettai, Vaniyambadi, Tirupathur District,
                  Tamil Nadu - 635801
                </p>
              </div>
              <div class="col-lg-4 col-md-6 mb-4 mb-md-0">
                <h5 class="text-uppercase mb-4 pb-1">Search something</h5>

                <div class="form-outline form-white mb-4">
                  <input
                    type="text"
                    id="formControlLg"
                    class="form-control form-control-lg"
                  />
                  <label class="form-label" for="formControlLg">
                    Search
                  </label>
                </div>

                <ul class="fa-ul" style={{marginLeft: "1.65em"}}>
                  <li class="mb-3">
                    <span class="fa-li">
                      <i class="fas fa-home"></i>
                    </span>
                    <span class="ms-2">Warsaw, 00-967, Poland</span>
                  </li>
                  <li class="mb-3">
                    <span class="fa-li">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <span class="ms-2">contact@example.com</span>
                  </li>
                  <li class="mb-3">
                    <span class="fa-li">
                      <i class="fas fa-phone"></i>
                    </span>
                    <span class="ms-2">+ 48 234 567 88</span>
                  </li>
                </ul>
              </div>
              <div class="col-lg-4 col-md-6 mb-4 mb-md-0">
                <h5 class="text-uppercase mb-4">Opening hours</h5>

                <table class="table text-center text-white">
                  <tbody class="fw-normal">
                    <tr>
                      <td>Mon - Thu:</td>
                      <td>8am - 9pm</td>
                    </tr>
                    <tr>
                      <td>Fri - Sat:</td>
                      <td>8am - 1am</td>
                    </tr>
                    <tr>
                      <td>Sunday:</td>
                      <td>9am - 10pm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div
            class="text-center p-3"
            style={{backgroundColor: "rgba(0, 0, 0, 0.2)"}}
          >
            © Copyrights Owned by
            <a class="text-white" href="https://AgathiyarPyramid.com/">
              AgathiyarPyramid.com
            </a>
          </div>
        </footer>
      </div>
  );
};
export default Footer;
