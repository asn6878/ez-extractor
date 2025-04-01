document.getElementById("extractBtn").addEventListener("click", async () => {
  document.getElementById("result").innerHTML = "";
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["common.js"],
    },
    () => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => window.extractImages(),
        },
        (results) => {
          loader.classList.add("hidden");

          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
          }
          const images = results[0].result;
          const resultDiv = document.getElementById("result");
          if (images.length === 0) {
            resultDiv.innerText = "추출된 이미지가 없습니다.";
          } else {
            images.forEach((item) => {
              const div = document.createElement("div");
              div.classList.add("img-item");
              const identifier =
                item.className !== "no identifier" ? item.className : item.id;
              div.innerHTML = `<img src="${item.src}" alt="image"><span><strong>${identifier}</strong></span>`;
              resultDiv.appendChild(div);
            });
          }
        }
      );
    }
  );
});

document
  .getElementById("extractElementBtn")
  .addEventListener("click", async () => {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["common.js"],
      },
      () => {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: function () {
              return new Promise((resolve) => {
                const highlight = document.createElement("div");
                highlight.style.position = "absolute";
                highlight.style.border = "4px solid red";
                highlight.style.pointerEvents = "none";
                highlight.style.zIndex = "9999";
                document.body.appendChild(highlight);

                // 안내 메시지를 위한 오버레이 생성
                const overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100%";
                overlay.style.height = "100%";
                overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                overlay.style.zIndex = "9998";
                overlay.style.display = "flex";
                overlay.style.justifyContent = "center";
                overlay.style.alignItems = "center";
                overlay.style.color = "white";
                overlay.style.fontSize = "20px";
                overlay.style.textAlign = "center";
                overlay.style.padding = "20px";
                overlay.innerHTML =
                  "마우스 호버로 영역을 확인한 후,<br>원하는 영역을 클릭하세요.<br><br>취소하려면 ESC 키를 누르세요.";
                document.body.appendChild(overlay);

                function startOnClick(event) {
                  event.preventDefault();
                  event.stopPropagation();

                  overlay.remove();

                  document.removeEventListener("click", startOnClick, true);

                  document.addEventListener("mousemove", onMouseMove);
                  document.addEventListener("click", onClick, true);
                  document.addEventListener("keydown", onKeyDown);
                }

                document.addEventListener("click", startOnClick, true);

                function onMouseMove(event) {
                  const { clientX, clientY } = event;
                  const element = document.elementFromPoint(clientX, clientY);
                  if (element) {
                    const rect = element.getBoundingClientRect();
                    highlight.style.top = rect.top + "px";
                    highlight.style.left = rect.left + "px";
                    highlight.style.width = rect.width + "px";
                    highlight.style.height = rect.height + "px";
                  }
                }

                function onClick(event) {
                  event.preventDefault();
                  event.stopPropagation();
                  document.removeEventListener("mousemove", onMouseMove);
                  document.removeEventListener("click", onClick, true);
                  document.removeEventListener("keydown", onKeyDown);

                  highlight.remove();
                  overlay.remove();

                  const element = document.elementFromPoint(
                    event.clientX,
                    event.clientY
                  );
                  const result = window.extractImages.call(element);
                  resolve(result);
                }

                function onKeyDown(event) {
                  if (event.key === "Escape") {
                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("click", onClick, true);
                    document.removeEventListener("keydown", onKeyDown);
                    highlight.remove();
                    overlay.remove();
                    resolve([]);
                  }
                }
              });
            },
          },
          (results) => {
            loader.classList.add("hidden");

            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
              return;
            }

            const images = results[0].result;
            if (images.length === 0) {
              resultDiv.innerText =
                "선택한 요소 내에 추출할 이미지가 없습니다.";
            } else {
              images.forEach((item) => {
                const div = document.createElement("div");
                div.classList.add("img-item");
                const identifier =
                  item.className !== "no identifier" ? item.className : item.id;
                div.innerHTML = `<img src="${item.src}" alt="image"><span><strong>${identifier}</strong></span>`;
                resultDiv.appendChild(div);
              });
            }
          }
        );
      }
    );
  });
