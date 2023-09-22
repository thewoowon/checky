import { useEffect, useState } from "react";
import parse from "html-react-parser";

const HrefList = () => {
  const [hrefList, setHrefList] = useState<Element[]>([]);

  const handleClickAnchorTag = (a: HTMLAnchorElement) => {
    a.focus();
    a.style.backgroundColor = "red";
    a.style.border = "1px solid red";
    a.style.color = "white";
  };

  useEffect(() => {
    // document.getElementById("search")에서 anchor 태그만 추출
    const aList = Array.from(
      document.getElementById("search")?.getElementsByTagName("a") ?? []
    );

    aList.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClickAnchorTag(a as HTMLAnchorElement);
      });
    });

    setHrefList(aList);
  }, []);

  return (
    <div>
      <h1>href list</h1>
      <ul>
        {hrefList.map((a, index) => (
          <li
            key={index}
            onClick={() => {
              handleClickAnchorTag(a as HTMLAnchorElement);
            }}
          >
            {parse(a.innerHTML)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HrefList;
