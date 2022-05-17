import React from 'react';
import styled from 'styled-components';

export interface IBoxProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  px?: number;
  py?: number;
  mt?: number;
  mb?: number;
  ml?: number | 'auto';
  between?: number;
  bold?: boolean;
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  textAlign?: 'center';
  flex?: boolean;
  column?: boolean;
  reverseDirection?: boolean;
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  justifyContent?: 'center' | 'space-between' | 'flex-start';
  withWrap?: boolean;
  grow?: boolean;
  background?: string;
  innerRef?: React.RefObject<HTMLDivElement>;
  onMouseEnter?(e: React.MouseEvent<HTMLDivElement>): void;
  onClick?(e: React.MouseEvent<HTMLDivElement>): void;
}

const TEXT_SIZES_MAP = {
  s: 14,
  m: 16,
  l: 20,
  xl: 26,
  xxl: 36,
};

function getBetweenMarginDirection(
  isFlex?: boolean,
  isColumn?: boolean,
  isReverse?: boolean,
): 'top' | 'bottom' | 'left' | 'right' {
  if (!isFlex) {
    return 'top';
  }

  if (isColumn) {
    return isReverse ? 'bottom' : 'top';
  }

  return isReverse ? 'right' : 'left';
}

const Root = styled.div`
  ${({ width }: IBoxProps) => (width ? `width: ${typeof width === 'number' ? `${width}px` : width};` : '')}
  ${({ height }: IBoxProps) => (height ? `height: ${typeof height === 'number' ? `${height}px` : height};` : '')}
  ${({ flex }: IBoxProps) => (flex ? 'display: flex;' : '')}
  ${({ reverseDirection, column }: IBoxProps) => {
    if (column) {
      return `flex-direction: column${reverseDirection ? '-reverse' : ''};`;
    }

    if (reverseDirection) {
      return 'flex-direction: row-reverse;';
    }
  }}
  ${({ alignItems }: IBoxProps) => (alignItems ? `align-items: ${alignItems};` : '')}
  ${({ justifyContent }: IBoxProps) => (justifyContent ? `justify-content: ${justifyContent};` : '')}
  ${({ withWrap }: IBoxProps) => (withWrap ? 'flex-wrap: wrap;' : '')}
  ${({ grow }: IBoxProps) => (grow ? 'flex-grow: 1;' : '')}
  ${({ px }: IBoxProps) =>
    px
      ? `
    padding-left: ${px}px;
    padding-right: ${px}px;
  `
      : ''}
  ${({ py }: IBoxProps) =>
    py
      ? `
    padding-top: ${py}px;
    padding-bottom: ${py}px;
  `
      : ''}
  ${({ mt }: IBoxProps) => (mt ? `margin-top: ${mt}px;` : '')}
  ${({ mb }: IBoxProps) => (mb ? `margin-bottom: ${mb}px;` : '')}
  ${({ ml }: IBoxProps) => (ml ? `margin-left: ${ml === 'auto' ? 'auto' : `${ml}px`};` : '')}
  ${({ between, flex, column, reverseDirection }: IBoxProps) =>
    between
      ? `& > *:not(:first-child) { margin-${getBetweenMarginDirection(flex, column, reverseDirection)}: ${between}px; }`
      : ''}
  ${({ bold }: IBoxProps) => (bold ? 'font-weight: bold;' : '')}
  ${({ size = 'm' }: IBoxProps) =>
    size
      ? `
    font-size: ${TEXT_SIZES_MAP[size]}px;
    line-height: 1.2;
  `
      : ''}
  ${({ textAlign }: IBoxProps) => (textAlign ? `text-align: ${textAlign};` : '')}
  ${({ background }: IBoxProps) => (background ? `background-color: ${background};` : '')}
`;

const Box: React.FC<IBoxProps> = (props) => {
  const { innerRef } = props;

  return <Root ref={innerRef} {...props} />;
};

export default React.memo(Box);
