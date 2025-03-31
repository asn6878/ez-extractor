document.getElementById("extractBtn").addEventListener("click", async () => {
  document.getElementById("result").innerHTML = "";
  const loader = document.getElementById("loader");
  loader.classList.remove("hidden");

  // 현재 활성 탭 정보 가져오기
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: extractImages,
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
          // class가 없으면 id를 사용, 둘 다 없으면 'no identifier'
          const identifier =
            item.className !== "no identifier" ? item.className : item.id;
          div.innerHTML = `<img src="${item.src}" alt="image"><span><strong>${identifier}</strong></span>`;
          resultDiv.appendChild(div);
        });
      }
    }
  );
});

document
  .getElementById("extractElementBtn")
  .addEventListener("click", async () => {
    // 결과 영역 초기화
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";
    // 로딩 스켈레톤 표시
    const loader = document.getElementById("loader");
    loader.classList.remove("hidden");

    // 현재 활성 탭 정보 가져오기
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: async function () {
          return await new Promise((resolve) => {
            // 하이라이트용 오버레이 엘리먼트 생성
            const highlight = document.createElement("div");
            highlight.style.position = "absolute";
            highlight.style.border = "4px solid red";
            highlight.style.pointerEvents = "none";
            highlight.style.zIndex = "9999";
            document.body.appendChild(highlight);

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
            document.addEventListener("mousemove", onMouseMove);

            // 클릭 이벤트 핸들러 등록 (캡처링 단계)
            function onClick(event) {
              // 클릭한 요소의 기본 동작 방지 및 전파 중단
              event.preventDefault();
              event.stopPropagation();
              // 마우스 무브, 클릭 리스너 제거
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("click", onClick, true);

              // 클릭한 위치의 요소 가져오기
              const element = document.elementFromPoint(
                event.clientX,
                event.clientY
              );
              // 하이라이트 제거
              highlight.remove();

              // 클릭한 요소 내부의 이미지들 추출
              const result = extractImages.call(element);
              resolve(result);
            }
            document.addEventListener("click", onClick, true);

            // 사용자에게 안내 메시지
            alert("마우스 호버로 영역을 확인한 후, 원하는 영역을 클릭하세요.");
          });
        },
      },
      (results) => {
        // 추출 완료 시 로딩 스켈레톤 숨기기
        loader.classList.add("hidden");

        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        const images = results[0].result;
        if (images.length === 0) {
          resultDiv.innerText = "선택한 요소 내에 추출할 이미지가 없습니다.";
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
  });

function extractImages() {
  const imgs = document.querySelectorAll("img");
  const result = [];
  imgs.forEach((img) => {
    const className = img.getAttribute("class");
    const idName = img.getAttribute("id");
    result.push({
      src: img.src,
      // class가 없으면 id가 있는지 확인, 둘 다 없으면 'no identifier'
      className: className ? className : idName ? idName : "no identifier",
      id: idName ? idName : "no identifier",
    });
  });
  return result;
}
