document.getElementById("extractBtn").addEventListener("click", async () => {
  document.getElementById("result").innerHTML = "";
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");

  const urlParams = new URLSearchParams(window.location.search);
  const targetTabId = Number(urlParams.get("targetTabId")); // 문자열을 숫자로 변환

  // 먼저 common.js를 주입하여 extractImages를 페이지에 등록합니다.
  chrome.scripting.executeScript(
    {
      target: { tabId: targetTabId },
      files: ["common.js"],
    },
    () => {
      // common.js 주입 후 extractImages를 호출합니다.
      chrome.scripting.executeScript(
        {
          target: { tabId: targetTabId },
          func: () => window.extractImages(), // window.extractImages 호출
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

    const urlParams = new URLSearchParams(window.location.search);
    const targetTabId = Number(urlParams.get("targetTabId")); // 문자열을 숫자로 변환

    // 먼저 common.js를 주입하여 extractImages를 페이지에 등록합니다.
    chrome.scripting.executeScript(
      {
        target: { tabId: targetTabId },
        files: ["common.js"],
      },
      () => {
        // common.js 주입 후 onMouseMove, onClick 이벤트를 포함한 로직을 실행합니다.
        chrome.scripting.executeScript(
          {
            target: { tabId: targetTabId },
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

                  // 오버레이 제거
                  overlay.remove();

                  // 시작 클릭 이벤트 리스너 제거
                  document.removeEventListener("click", startOnClick, true);

                  // 요소 선택을 위한 이벤트 리스너 등록
                  document.addEventListener("mousemove", onMouseMove);
                  document.addEventListener("click", onClick, true);
                  document.addEventListener("keydown", onKeyDown);
                }

                // 최초 클릭 이벤트 리스너 등록
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
