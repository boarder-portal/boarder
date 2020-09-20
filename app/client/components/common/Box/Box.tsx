import React from 'react';
import styled from 'styled-components';

interface IBoxProps {
  className?: string;
  children: React.ReactNode;
  px?: number;
  py?: number;
  mt?: number;
  mb?: number;
  ml?: number | 'auto';
  between?: number;
  bold?: boolean;
  size?: 's' | 'm' | 'l' | 'xl' | 'xxl';
  flex?: boolean;
  column?: boolean;
  alignItems?: 'center' | 'flex-end';
  justifyContent?: 'center';
  withWrap?: boolean;
  background?: string;
  onClick?(e: React.MouseEvent<HTMLDivElement>): void;
}

const TEXT_SIZES_MAP = {
  s: 14,
  m: 16,
  l: 20,
  xl: 26,
  xxl: 36,
};

const Root = styled.div`
  ${({ flex }: IBoxProps) => flex ? 'display: flex;' : ''}
  ${({ column }: IBoxProps) => column ? 'flex-direction: column;' : ''}
  ${({ alignItems }: IBoxProps) => alignItems ? `align-items: ${alignItems};` : ''}
  ${({ justifyContent }: IBoxProps) => justifyContent ? `justify-content: ${justifyContent};` : ''}
  ${({ withWrap }: IBoxProps) => withWrap ? 'flex-wrap: wrap;' : ''}
  ${({ px }: IBoxProps) => px ? `
    padding-left: ${px}px;
    padding-right: ${px}px;
  ` : ''}
  ${({ py }: IBoxProps) => py ? `
    padding-top: ${py}px;
    padding-bottom: ${py}px;
  ` : ''}
  ${({ mt }: IBoxProps) => mt ? `margin-top: ${mt}px;` : ''}
  ${({ mb }: IBoxProps) => mb ? `margin-bottom: ${mb}px;` : ''}
  ${({ ml }: IBoxProps) => ml ? `margin-left: ${ml === 'auto' ? 'auto' : `${ml}px`};` : ''}
  ${({ between, flex, column }: IBoxProps) => between ?
    `& > *:not(:first-child) { margin-${flex ? column ? 'top' : 'left' : 'top'}: ${between}px; }`
    : ''}
  ${({ bold }: IBoxProps) => bold ? 'font-weight: bold;' : ''}
  ${({ size = 'm' }: IBoxProps) => size ? `
    font-size: ${TEXT_SIZES_MAP[size]}px;
    line-height: 1.2;
  ` : ''}
  ${({ background }: IBoxProps) => background ? `background-color: ${background};` : ''}
`;

const Box: React.FC<IBoxProps> = (props) => {
  const { className, children } = props;

  return (
    <Root className={className} {...props}>{children}</Root>
  );
};

export default React.memo(Box);
