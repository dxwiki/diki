import { TermData } from '@/types/database';
import React, { useState, useRef, useEffect } from 'react';
import MarkdownContent from '../posts/MarkdownContent';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DescriptionSectionProps {
  formData: TermData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=> void;
}

const DescriptionSection = ({ formData, handleChange }: DescriptionSectionProps) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const guideContentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [showDescGuidance, setShowDescGuidance] = useState<boolean>(true);

  useEffect(() => {
    if (guideContentRef.current) {
      setContentHeight(guideContentRef.current.scrollHeight);
    }
  }, [isGuideOpen]);

  useEffect(() => {
    if (formData.description?.full && formData.description.full.trim() !== '') {
      setShowDescGuidance(false);
    } else {
      setShowDescGuidance(true);
    }
  }, [formData.description?.full]);

  const toggleGuide = () => {
    setIsGuideOpen(!isGuideOpen);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (e.target.value.trim() !== '') {
      setShowDescGuidance(false);
    } else {
      setShowDescGuidance(true);
    }

    e.target.style.height = 'auto';
    e.target.style.height = `calc(${ e.target.scrollHeight }px)`;
  };

  const tips = () => {
    return (
      <div className="flex flex-col gap-2 bg-background">
        <button
          type="button"
          className="flex justify-center items-center text-main bg-gray4 hover:bg-secondary py-2 text-sm font-medium rounded-lg cursor-pointer"
          onClick={toggleGuide}
        >
          <span className="flex-1 text-center">{'마크다운 문법 가이드'}</span>
          {isGuideOpen ? (
            <ChevronUp className="size-5 mr-2" />
          ) : (
            <ChevronDown className="size-5 mr-2" />
          )}
        </button>
        <div
          ref={guideContentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ height: isGuideOpen ? (contentHeight ? `${ contentHeight }px` : 'auto') : '0px' }}
        >
          <div className={`grid grid-cols-[auto_1fr] items-center gap-px bg-gray4 text-sm ${ isGuideOpen ? 'animate-slideDown' : '' }`}>
            <div className="bg-background flex justify-center items-center text-sub h-full px-2 border-t border-gray4 font-bold">{'문법'}</div>
            <div className="flex justify-center items-center gap-2 bg-background py-1 px-2 border-t border-gray4 font-bold">
              <MarkdownContent content="설명" />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'**굵은 텍스트**'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="**굵은 텍스트**는 별표 2개(**)를 단어에 감싸 사용합니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'*기울임 텍스트*'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="*기울임 텍스트*는 별표(*)를 단어에 감싸 사용합니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'`인라인 코드`'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="`인라인 코드`는 억음 부호(`)을 단어에 감싸 사용합니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'- 목록'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="- 목록은 하이픈(-)을 사용합니다.<br> - 다음 목록은 줄바꿈으로 구분됩니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'1. 번호 목록'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="1. 번호 목록은 숫자를 사용합니다.<br> 2. 다음 목록은 줄바꿈으로 구분됩니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">
              <span>{'$인라인 수식$'}</span>
            </div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="$E=mc^2$ 와 같이 달러 기호($)를 사용해 인라인 수식을 만들 수 있습니다." />
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">
              <span>{'$$블록 수식$$'}</span>
            </div>
            <div className="flex flex-col justify-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="$$Z=10$$" />
              <span>{'와 같이 달러 기호 2개(\$\$)를 사용해 한 줄을 차지하는 블록 수식을 만들 수 있습니다.'}</span>
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'[링크 텍스트](URL)'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2">
              <MarkdownContent content="[diki.kr](https://www.diki.kr)와 같이 대괄호에 링크 텍스트를, 소괄호에 URL을 넣어 링크를 만듭니다." />
            </div>
            <div className="bg-background flex items-center text-sub h-full px-2">{'![이미지 캡션](URL)'}</div>
            <div className="w-full gap-2 bg-background ">
              <div className="w-1/2 mx-auto">
                <MarkdownContent content="![디키 웹사이트](https://www.diki.kr/thumbnail.png)" />
              </div>
              <div className="px-2">
                <MarkdownContent content="- 위와 같이 대괄호에 이미지 캡션을, 소괄호에 URL을 넣어 이미지를 만듭니다.<br>- 이미지의 폭은 전체 너비입니다.<br>- 이미지가 없는 경우, 기본 이미지와 캡션만 표출됩니다." />
              </div>
            </div>

            <div className="bg-background flex items-center text-sub h-full px-2">{'> 인용구'}</div>
            <div className="flex items-center gap-2 bg-background py-1 px-2 font-tinos">
              <MarkdownContent content="> 인용구는 오른쪽 꺽쇠 기호(>)를 사용합니다.<br>> `> 인용구 + 줄바꿈 + > 인용구` 와 같이 사용하여 여러 줄도 가능합니다." />
            </div>

            <div className="size-full bg-background flex flex-col justify-center items-center text-sub px-2 border-b border-gray4">
              <span className="w-full">{'| 제목1 | 제목2 |'}</span>
              <span className="w-full tracking-[0.135rem]">{'| --- | --- |'}</span>
              <span className="w-full">{'| 내용1 | 내용2 |'}</span>
            </div>
            <div className="flex items-center gap-2 bg-background py-1 px-2 border-b border-gray4">
              <MarkdownContent content="|  제목1  |  제목2  |<br>| ---- | ---- |<br>|  내용1  |  내용2  |<br><br>Markdown 형식으로 표를 만들 수 있습니다. 첫 번째 열은 자동으로 중앙 정렬됩니다." />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2">
      <textarea
        name="description.full"
        value={formData.description?.full || ''}
        onChange={handleDescriptionChange}
        className="w-full p-2 border border-gray4 text-main rounded-md min-h-[646px]"
        placeholder="포스트에 대한 개념을 마크다운 형식으로 작성하세요."
        rows={27}
      />
      {showDescGuidance && (
        <p className="text-sm text-level-5 ml-1 mb-2">{'본문을 작성해주세요.'}</p>
      )}
      {tips()}
    </div>
  );
};

export default DescriptionSection;