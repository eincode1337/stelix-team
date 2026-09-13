'use client'


import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { useSignInDrawer } from '@/components/auth/SignInDrawer'
import { t } from '@/i18n/t'

const arc = (...n: string[]) => n.map((v) => `AddResourceContent-module__UdTvSa__${v}`).join(' ')
const sub = (...n: string[]) => n.map((v) => `Subscriptions-module__JUE8VG__${v}`).join(' ')
const rs = (...n: string[]) => n.map((v) => `Resources-module__Zk5JmW__${v}`).join(' ')
const rd = (...n: string[]) => n.map((v) => `ResourceDetail-module__XriO0W__${v}`).join(' ')
const phb = (...n: string[]) => n.map((v) => `PageHeaderBar-module__1SDZQW__${v}`).join(' ')
const adm = (...n: string[]) => n.map((v) => `AdminPanel-module__8pW_9a__${v}`).join(' ')
const dd = (...n: string[]) => n.map((v) => `Dropdown-module__DasDQW__${v}`).join(' ')
const inp = (...n: string[]) => n.map((v) => `Input-module__rdnxQa__${v}`).join(' ')
const btn = (...n: string[]) => n.map((v) => `Button-module__VMVMAW__${v}`).join(' ')
const cat = (...n: string[]) => n.map((v) => `CategoryIcon-module__kwjccG__${v}`).join(' ')
const tg = (...n: string[]) => n.map((v) => `Toggle-module__ntMQ3a__${v}`).join(' ')
const cr = (...n: string[]) => n.map((v) => `CreateResourceContent-module__b5R2iG__${v}`).join(' ')

const swatchVar = (hex: string): CSSProperties => ({ ['--swatch']: hex }) as CSSProperties
const dockLift: CSSProperties = { ['--product-manage-dock-lift']: '0px' } as CSSProperties

const DEFAULT_API_KEY = 'e57e478a673c1f117fe62ac16d2753930c387b704ca2e40aab40206dfae0cb33'
const DEFAULT_SERVICE_ID = '585d78ab-acf5-4aa6-9891-05ddcc55e615'
const WEBHOOK_IP = '5.53.123.156'

const CARD_COLORS = ['#569bfd', '#7c6cf5', '#2dd4bf', '#34d399', '#f59e0b', '#fb7185'] as const

const CATEGORIES: Array<{ value: string; label: string }> = [
  { value: 'plugins', label: 'Плагины' },
  { value: 'modules', label: 'Модули' },
  { value: 'scripts', label: 'Скрипты' },
  { value: 'maps', label: 'Карты' },
  { value: 'integrations', label: 'Интеграции' },
  { value: 'models', label: 'Модели' },
  { value: 'particles', label: 'Партиклы' },
  { value: 'assemblies', label: 'Сборки' },
  { value: 'tools', label: 'Инструменты' },
  { value: 'other', label: 'Другое' },
]

const WEBHOOK_PARAMS: Array<{ key: string; label: string }> = [
  { key: 'user', label: 'user' },
  { key: 'steamid', label: 'steamid' },
  { key: 'discordid', label: 'discordid' },
  { key: 'servers', label: 'servers' },
  { key: 'domains', label: 'domains' },
  { key: 'apikey', label: 'apikey' },
  { key: 'service', label: 'service' },
]

type PlanRow = { uid: number; months: number; price: number }
type CardColor = 'auto' | 'custom' | (typeof CARD_COLORS)[number]
type WebhookParams = Record<string, boolean>

const P_GRIP =
  'M64 88a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm64-24A64 64 0 1 1 0 64 64 64 0 1 1 128 64zM64 280a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm64-24a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zM40 448c0 13.3 10.7 24 24 24s24-10.7 24-24-10.7-24-24-24-24 10.7-24 24zm24-64c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM256 88a24 24 0 1 0 0-48 24 24 0 1 0 0 48zm64-24a64 64 0 1 1 -128 0 64 64 0 1 1 128 0zM232 256a24 24 0 1 0 48 0 24 24 0 1 0 -48 0zm24 64a64 64 0 1 1 0-128 64 64 0 1 1 0 128zm0 152c13.3 0 24-10.7 24-24s-10.7-24-24-24-24 10.7-24 24 10.7 24 24 24zm-64-24c0-35.3 28.7-64 64-64s64 28.7 64 64-28.7 64-64 64-64-28.7-64-64z'
const P_TRASH =
  'M166.2-16c-13.3 0-25.3 8.3-30 20.8L120 48 24 48C10.7 48 0 58.7 0 72S10.7 96 24 96l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-96 0-16.2-43.2C307.1-7.7 295.2-16 281.8-16L166.2-16zM32 144l0 304c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-304-48 0 0 304c0 8.8-7.2 16-16 16L96 464c-8.8 0-16-7.2-16-16l0-304-48 0zm160 72c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176zm112 0c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 176c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176z'
const P_ERASER =
  'M569 9c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-200 200-12.9-12.9c-20.2-20.2-51.4-24.6-76.3-10.7L16.4 278.9C6.3 284.5 0 295.2 0 306.8 0 315.2 3.4 323.4 9.3 329.3L214.7 534.7c6 6 14.1 9.3 22.6 9.3 11.6 0 22.3-6.3 27.9-16.4L392.6 298.2c13.9-25 9.5-56.1-10.7-76.3L369 209 569 9zM288.2 196.1l59.7 59.7c5.1 5.1 6.1 12.8 2.7 19.1l-14.9 26.8-93.4-93.4 26.8-14.9c6.2-3.5 14-2.4 19.1 2.7zm-89.6 36.5l112.8 112.8-77.9 140.3-96.5-96.5 18-53.9c2.1-6.3-3.9-12.2-10.1-10.1l-53.9 18-32.5-32.5 140.3-77.9z'
const P_RESET =
  'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15'
const P_API_DOCS =
  'M344 380c24.3 0 44 19.7 44 44l0 104c0 11-9 20-20 20s-20-9-20-20l0-28-24 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-104c0-24.3 19.7-44 44-44l16 0zm120 0c33.1 0 60 26.9 60 60s-26.9 60-60 60l-12 0 0 28c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20l32 0zm96 0c11 0 20 9 20 20l0 128c0 11-9 20-20 20s-20-9-20-20l0-128c0-11 9-20 20-20zM328 420c-2.2 0-4 1.8-4 4l0 36 24 0 0-36c0-2.2-1.8-4-4-4l-16 0zm124 40l12 0c11 0 20-9 20-20s-9-20-20-20l-12 0 0 40zM331.2-16c18.7 0 34.9 13 39 31.2l12.6 55.6C389 74 395.1 77.5 401 81.3l54.5-16.9c17.8-5.5 37.2 2 46.5 18.2l43.2 74.8c9.3 16.2 6.2 36.7-7.5 49.4l-41.9 38.7c.3 6.9 .3 14 0 20.9l41.9 38.7c8.8 8.1 13.2 19.5 12.8 30.8l-50.2 0-45.6-42.2c-5.6-5.2-8.4-12.7-7.6-20.2 1.3-11.5 1.3-23.6 0-35.2-.8-7.6 2-15.1 7.6-20.3l45.7-42.3-36.8-63.7-59.5 18.5c-7.3 2.3-15.2 .9-21.3-3.6-9.4-6.9-19.6-12.8-30.4-17.6-7-3.1-12.1-9.3-13.8-16.7l-13.7-60.8-73.6 0-13.7 60.8c-1.7 7.4-6.8 13.6-13.8 16.7-10.8 4.7-21 10.7-30.4 17.6-6.1 4.5-14.1 5.9-21.4 3.6l-59.5-18.5-36.8 63.7 45.8 42.3c5.6 5.2 8.4 12.7 7.6 20.3-1.3 11.5-1.3 23.6 0 35.2 .8 7.6-2 15.1-7.6 20.2l-45.8 42.3 36.8 63.8 59.5-18.5c7.3-2.3 15.2-.9 21.4 3.6 8.9 6.6 18.6 12.2 28.8 16.8 5.8 2.6 11.8 4.8 17.9 6.8l0 49.8c-16.4-3.9-32.1-9.7-46.8-17.2-6.2-3.2-12.4-6.7-18.2-10.5l-54.5 16.9c-17.9 5.5-37.2-2-46.5-18.2L30.8 354.6c-9.3-16.2-6.2-36.7 7.5-49.4l41.9-38.7c-.3-6.9-.3-14 0-20.9L38.3 206.8c-13.7-12.7-16.8-33.2-7.5-49.4L74 82.6c9.3-16.2 28.7-23.8 46.5-18.2L175 81.3c5.9-3.8 11.9-7.3 18.2-10.5l12.6-55.6C209.9-3 226.1-16 244.8-16l86.4 0zM288 352a96 96 0 1 1 0-192 96 96 0 1 1 0 192zm0-144a48 48 0 1 0 0 96 48 48 0 1 0 0-96z'
const P_COPY_KEY =
  'M480 400L288 400C279.2 400 272 392.8 272 384L272 128C272 119.2 279.2 112 288 112L421.5 112C425.7 112 429.8 113.7 432.8 116.7L491.3 175.2C494.3 178.2 496 182.3 496 186.5L496 384C496 392.8 488.8 400 480 400zM288 448L480 448C515.3 448 544 419.3 544 384L544 186.5C544 169.5 537.3 153.2 525.3 141.2L466.7 82.7C454.7 70.7 438.5 64 421.5 64L288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L368 496L368 512C368 520.8 360.8 528 352 528L160 528C151.2 528 144 520.8 144 512L144 256C144 247.2 151.2 240 160 240L176 240L176 192L160 192z'
const P_COPY_INLINE =
  'M288 64C252.7 64 224 92.7 224 128L224 384C224 419.3 252.7 448 288 448L480 448C515.3 448 544 419.3 544 384L544 183.4C544 166 536.9 149.3 524.3 137.2L466.6 81.8C454.7 70.4 438.8 64 422.3 64L288 64zM160 192C124.7 192 96 220.7 96 256L96 512C96 547.3 124.7 576 160 576L352 576C387.3 576 416 547.3 416 512L416 496L352 496L352 512L160 512L160 256L176 256L176 192L160 192z'
const P_WEBHOOK =
  'M205.1 225.5L138.7 344.4c-19.6 2.6-34.7 19.4-34.7 39.6 0 22.1 17.9 40 40 40s40-17.9 40-40c0-5.8-1.2-11.3-3.4-16.2l76.9-137.6c6.4-11.5 2.4-26.1-9.1-32.6-30.4-17.3-46.9-53.3-38-88.9 10.7-42.9 54.1-69 97-58.3 35.6 8.9 59.7 40.3 60.6 75.3 .4 13.2 11.4 23.7 24.7 23.3s23.7-11.4 23.3-24.7c-1.6-56-40-106.3-97-120.5-68.6-17.1-138.1 24.7-155.2 93.3-12.2 48.8 5.5 98 41.3 128.5zm119.5-81.4c2.2-4.9 3.4-10.4 3.4-16.1 0-22.1-17.9-40-40-40s-40 17.9-40 40c0 20.3 15.2 37.1 34.8 39.7l77.3 137.4c3.1 5.5 8.3 9.6 14.5 11.3s12.7 .9 18.2-2.2c30.5-17.2 69.9-12.7 95.8 13.2 31.2 31.2 31.2 81.9 0 113.1-25.9 25.9-65.3 30.4-95.8 13.2-11.5-6.5-26.2-2.4-32.7 9.1s-2.4 26.2 9.1 32.7c48.8 27.5 111.7 20.5 153.3-21.1 50-50 50-131 0-181-35.5-35.5-86.7-45.8-131.2-30.9L324.6 144.1zM432 424c22.1 0 40-17.9 40-40s-17.9-40-40-40c-13.1 0-24.7 6.3-32 16l-152 0c-6.4 0-12.5 2.5-17 7s-7 10.6-7 17c0 34.8-22.9 66.8-58 76.9-42.5 12.2-86.8-12.4-99-54.9-10.1-35.3 5.1-71.8 34.9-90.2 11.3-6.9 14.8-21.7 7.9-33s-21.7-14.8-33-7.9c-47.7 29.3-72.1 87.8-55.9 144.3 19.5 68 90.4 107.2 158.3 87.8 48-13.8 81.7-53.2 90.5-99L400 408c7.3 9.7 18.9 16 32 16z'
const P_INFO =
  'M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM216 336c-13.3 0-24 10.7-24 24s10.7 24 24 24l80 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-8 0 0-88c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l24 0 0 64-24 0zm40-144a32 32 0 1 0 0-64 32 32 0 1 0 0 64z'
const P_CATEGORY =
  'M232.5 5.2c14.9-6.9 32.1-6.9 47 0l218.6 101c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 149.8C5.4 145.8 0 137.3 0 128s5.4-17.9 13.9-21.8L232.5 5.2zM48.1 218.4l164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 277.8C5.4 273.8 0 265.3 0 256s5.4-17.9 13.9-21.8l34.1-15.8zM13.9 362.2l34.1-15.8 164.3 75.9c27.7 12.8 59.6 12.8 87.3 0l164.3-75.9 34.1 15.8c8.5 3.9 13.9 12.4 13.9 21.8s-5.4 17.9-13.9 21.8l-218.6 101c-14.9 6.9-32.1 6.9-47 0L13.9 405.8C5.4 401.8 0 393.3 0 384s5.4-17.9 13.9-21.8z'

const MD_TOOLBAR: Array<{ label: string; path: string; wrap?: boolean }> = [
  { label: 'Заголовок H1', path: 'M5 17V7h2v4h4V7h2v10h-2v-4H7v4zm12 0V9h-2V7h4v10z' },
  { label: 'Заголовок H2', path: 'M3 17V7h2v4h4V7h2v10H9v-4H5v4zm10 0v-4q0-.825.588-1.412T15 11h4V9h-6V7h6q.825 0 1.413.588T21 9v2q0 .825-.587 1.413T19 13h-4v2h6v2z' },
  { label: 'Заголовок H3', path: 'M3 17V7h2v4h4V7h2v10H9v-4H5v4zm10 0v-2h6v-2h-4v-2h4V9h-6V7h6q.825 0 1.413.588T21 9v6q0 .825-.587 1.413T19 17z' },
  { label: 'Заголовок H4', path: 'M3 17V7h2v4h4V7h2v10H9v-4H5v4zm15 0v-3h-5V7h2v5h3V7h2v5h2v2h-2v3z' },
  { label: 'Заголовок H5', path: 'M3 17V7h2v4h4V7h2v10H9v-4H5v4zm10 0v-2h6v-2h-6V7h8v2h-6v2h4q.825 0 1.413.588T21 13v2q0 .825-.587 1.413T19 17z' },
  { label: 'Заголовок H6', path: 'M3 17V7h2v4h4V7h2v10H9v-4H5v4zm12 0q-.825 0-1.412-.587T13 15V9q0-.825.588-1.412T15 7h6v2h-6v2h4q.825 0 1.413.588T21 13v2q0 .825-.587 1.413T19 17zm0-4v2h4v-2z' },
  { label: 'Список', path: 'M10 19q-.425 0-.712-.288T9 18t.288-.712T10 17h10q.425 0 .713.288T21 18t-.288.713T20 19zm0-6q-.425 0-.712-.288T9 12t.288-.712T10 11h10q.425 0 .713.288T21 12t-.288.713T20 13zm0-6q-.425 0-.712-.288T9 6t.288-.712T10 5h10q.425 0 .713.288T21 6t-.288.713T20 7zM5 20q-.825 0-1.412-.587T3 18t.588-1.412T5 16t1.413.588T7 18t-.587 1.413T5 20m0-6q-.825 0-1.412-.587T3 12t.588-1.412T5 10t1.413.588T7 12t-.587 1.413T5 14m0-6q-.825 0-1.412-.587T3 6t.588-1.412T5 4t1.413.588T7 6t-.587 1.413T5 8' },
  { label: 'Нумерация', path: 'M3.75 22q-.325 0-.537-.213T3 21.25t.213-.537t.537-.213H5.5v-.75h-.75q-.325 0-.537-.213T4 19t.213-.537t.537-.213h.75v-.75H3.75q-.325 0-.537-.213T3 16.75t.213-.537T3.75 16H6q.425 0 .713.288T7 17v1q0 .425-.288.713T6 19q.425 0 .713.288T7 20v1q0 .425-.288.713T6 22zm0-7q-.325 0-.537-.213T3 14.25v-2q0-.425.288-.712T4 11.25h1.5v-.75H3.75q-.325 0-.537-.213T3 9.75t.213-.537T3.75 9H6q.425 0 .713.288T7 10v1.75q0 .425-.288.713T6 12.75H4.5v.75h1.75q.325 0 .538.213T7 14.25t-.213.538T6.25 15zm1.5-7q-.325 0-.537-.213T4.5 7.25V3.5h-.75q-.325 0-.537-.213T3 2.75t.213-.537T3.75 2h1.5q.325 0 .538.213T6 2.75v4.5q0 .325-.213.538T5.25 8M10 19q-.425 0-.712-.288T9 18t.288-.712T10 17h10q.425 0 .713.288T21 18t-.288.713T20 19zm0-6q-.425 0-.712-.288T9 12t.288-.712T10 11h10q.425 0 .713.288T21 12t-.288.713T20 13zm0-6q-.425 0-.712-.288T9 6t.288-.712T10 5h10q.425 0 .713.288T21 6t-.288.713T20 7z' },
  { label: 'Жирный', path: 'M8.8 19q-.825 0-1.412-.587T6.8 17V7q0-.825.588-1.412T8.8 5h3.525q1.625 0 3 1T16.7 8.775q0 1.275-.575 1.963t-1.075.987q.625.275 1.388 1.025T17.2 15q0 2.225-1.625 3.113t-3.05.887zm1.025-2.8h2.6q1.2 0 1.463-.612t.262-.888t-.262-.887t-1.538-.613H9.825zm0-5.7h2.325q.825 0 1.2-.425t.375-.95q0-.6-.425-.975t-1.1-.375H9.825z' },
  { label: 'Курсив', path: 'M6.25 19q-.525 0-.888-.363T5 17.75t.363-.888t.887-.362H9l3-9H9.25q-.525 0-.888-.363T8 6.25t.363-.888T9.25 5h7.5q.525 0 .888.363T18 6.25t-.363.888t-.887.362H14.5l-3 9h2.25q.525 0 .888.363t.362.887t-.363.888t-.887.362z' },
  { label: 'Подчёркнутый', path: 'M6 21q-.425 0-.712-.288T5 20t.288-.712T6 19h12q.425 0 .713.288T19 20t-.288.713T18 21zm6-4q-2.525 0-3.925-1.575t-1.4-4.175V4.275q0-.525.388-.9T7.975 3t.9.375t.375.9V11.4q0 1.4.7 2.275t2.05.875t2.05-.875t.7-2.275V4.275q0-.525.388-.9T16.05 3t.9.375t.375.9v6.975q0 2.6-1.4 4.175T12 17' },
  { label: 'Зачёркнутый', path: 'M12.15 20q-1.575 0-2.912-.837t-2.113-2.238q-.225-.4-.062-.837t.587-.663q.45-.25.938-.088t.762.613q.45.75 1.213 1.2t1.637.45q1.1 0 1.913-.675t.812-1.725q0-.5.35-.85t.85-.35t.863.35t.362.85v.3q0 1.975-1.562 3.238T12.15 20M3 12q-.425 0-.712-.288T2 11t.288-.712T3 10h18q.425 0 .713.288T22 11t-.288.713T21 12zm5.2-4.125q-.425-.25-.575-.737t.1-.913q.625-1.175 1.8-1.775t2.525-.6q1.2 0 2.262.5T16.1 5.8q.275.35.175.8t-.475.725q-.425.3-.912.225t-.838-.475q-.375-.425-.875-.625t-1.075-.2q-.675 0-1.3.275t-.95.85q-.25.45-.737.6t-.913-.1' },
  { label: 'Влево', path: 'M4 21q-.425 0-.712-.288T3 20t.288-.712T4 19h16q.425 0 .713.288T21 20t-.288.713T20 21zm0-4q-.425 0-.712-.288T3 16t.288-.712T4 15h10q.425 0 .713.288T15 16t-.288.713T14 17zm0-4q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm0-4q-.425 0-.712-.288T3 8t.288-.712T4 7h10q.425 0 .713.288T15 8t-.288.713T14 9zm0-4q-.425 0-.712-.288T3 4t.288-.712T4 3h16q.425 0 .713.288T21 4t-.288.713T20 5z' },
  { label: 'По центру', path: 'M4 21q-.425 0-.712-.288T3 20t.288-.712T4 19h16q.425 0 .713.288T21 20t-.288.713T20 21zm4-4q-.425 0-.712-.288T7 16t.288-.712T8 15h8q.425 0 .713.288T17 16t-.288.713T16 17zm-4-4q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm4-4q-.425 0-.712-.288T7 8t.288-.712T8 7h8q.425 0 .713.288T17 8t-.288.713T16 9zM4 5q-.425 0-.712-.288T3 4t.288-.712T4 3h16q.425 0 .713.288T21 4t-.288.713T20 5z' },
  { label: 'Вправо', path: 'M4 5q-.425 0-.712-.288T3 4t.288-.712T4 3h16q.425 0 .713.288T21 4t-.288.713T20 5zm6 4q-.425 0-.712-.288T9 8t.288-.712T10 7h10q.425 0 .713.288T21 8t-.288.713T20 9zm-6 4q-.425 0-.712-.288T3 12t.288-.712T4 11h16q.425 0 .713.288T21 12t-.288.713T20 13zm6 4q-.425 0-.712-.288T9 16t.288-.712T10 15h10q.425 0 .713.288T21 16t-.288.713T20 17zm-6 4q-.425 0-.712-.288T3 20t.288-.712T4 19h16q.425 0 .713.288T21 20t-.288.713T20 21z' },
  { label: 'Цвет текста', wrap: true, path: 'M3 24q-.425 0-.712-.288T2 23v-2q0-.425.288-.712T3 20h18q.425 0 .713.288T22 21v2q0 .425-.288.713T21 24zm4.125-7q-.575 0-.913-.488t-.137-1.037l4.4-11.725q.125-.35.425-.55t.65-.2h.9q.375 0 .663.2t.412.55L17.95 15.5q.2.55-.137 1.025T16.9 17q-.35 0-.65-.2t-.425-.55l-.975-2.85H9.2l-1.025 2.875q-.125.35-.413.538T7.126 17M9.9 11.4h4.2l-2.05-5.8h-.1z' },
  { label: 'Шрифт Unbounded', path: 'M9.6 14.95h4.8l.875 2.425q.1.275.35.45t.55.175q.5 0 .813-.413t.112-.912l-3.8-10.05q-.125-.275-.375-.45T12.375 6h-.75q-.3 0-.55.175t-.375.45l-3.8 10.05q-.2.475.1.9t.8.425q.325 0 .563-.175t.362-.475zm.6-1.75l1.75-4.95h.1l1.75 4.95zM4 22q-.825 0-1.412-.587T2 20V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v16q0 .825-.587 1.413T20 22zm0-2h16V4H4zM4 4v16z' },
  { label: 'Скрытый текст', path: 'M15.175 8.325q.725.725 1.063 1.65t.237 1.9q0 .375-.275.638t-.65.262t-.638-.262t-.262-.638q.125-.65-.075-1.25T13.95 9.6t-1.025-.65t-1.275-.1q-.375 0-.638-.275t-.262-.65t.263-.637t.637-.263q.95-.1 1.875.238t1.65 1.062M12 6q-.475 0-.925.037t-.9.138q-.425.075-.763-.125t-.462-.6t.088-.775t.612-.45q.575-.125 1.163-.175T12 4q3.425 0 6.263 1.8t4.337 4.85q.1.2.15.413t.05.437t-.038.438t-.137.412q-.45 1-1.112 1.875t-1.463 1.6q-.3.275-.7.225t-.65-.4t-.212-.763t.337-.687q.6-.575 1.1-1.25t.875-1.45q-1.25-2.525-3.613-4.012T12 6m0 13q-3.35 0-6.125-1.812T1.5 12.425q-.125-.2-.187-.437T1.25 11.5t.05-.475t.175-.45q.5-1 1.163-1.912T4.15 7L2.075 4.9q-.275-.3-.262-.712T2.1 3.5t.7-.275t.7.275l17 17q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275l-3.5-3.45q-.875.275-1.775.413T12 19M5.55 8.4q-.725.65-1.325 1.425T3.2 11.5q1.25 2.525 3.613 4.013T12 17q.5 0 .975-.062t.975-.138l-.9-.95q-.275.075-.525.113T12 16q-1.875 0-3.188-1.312T7.5 11.5q0-.275.038-.525t.112-.525zm4.2 4.2' },
  { label: 'Горизонтальный разделитель', path: 'M7 13q-.425 0-.712-.288T6 12t.288-.712T7 11h10q.425 0 .713.288T18 12t-.288.713T17 13z' },
  { label: 'Вертикальный разделитель', path: 'M11 5h2v14h-2z' },
  { label: 'Ссылка', wrap: true, path: 'M17 17h-2.025q-.425 0-.7-.288T14 16t.288-.712T15 15h2v-2q0-.425.288-.712T18 12t.713.288T19 13v2h2q.425 0 .713.288T22 16t-.288.713T21 17h-2v2q0 .425-.288.713T18 20t-.712-.288T17 19zm-7 0H7q-2.075 0-3.537-1.463T2 12t1.463-3.537T7 7h3q.425 0 .713.288T11 8t-.288.713T10 9H7q-1.25 0-2.125.875T4 12t.875 2.125T7 15h3q.425 0 .713.288T11 16t-.288.713T10 17m-1-4q-.425 0-.712-.288T8 12t.288-.712T9 11h6q.425 0 .713.288T16 12t-.288.713T15 13zm13-1h-2q0-1.25-.875-2.125T17 9h-3.025q-.425 0-.7-.288T13 8t.288-.712T14 7h3q2.075 0 3.538 1.463T22 12' },
  { label: 'Картинка', wrap: true, path: 'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7q.425 0 .713.288T13 4t-.288.713T12 5H5v14h14v-6q0-.425.288-.712T20 12t.713.288T21 13v6q0 .825-.587 1.413T19 21zM18 5.825l-.9.875q-.275.275-.687.287T15.7 6.7q-.275-.275-.275-.7t.275-.7l2.6-2.6q.15-.15.325-.225T19 2.4t.375.075t.325.225l2.6 2.6q.275.275.288.688T22.3 6.7q-.275.275-.7.275t-.7-.275l-.9-.875V9q0 .425-.287.713T19 10t-.712-.288T18 9zM7 17h10q.3 0 .45-.275t-.05-.525l-2.75-3.675q-.15-.2-.4-.2t-.4.2L11.25 16L9.4 13.525q-.15-.2-.4-.2t-.4.2l-2 2.675q-.2.25-.05.525T7 17' },
  { label: 'Видео', wrap: true, path: 'M9 13v2q0 .425.288.713T10 16t.713-.288T11 15v-2h2q.425 0 .713-.288T14 12t-.288-.712T13 11h-2V9q0-.425-.288-.712T10 8t-.712.288T9 9v2H7q-.425 0-.712.288T6 12t.288.713T7 13zm-5 7q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h12q.825 0 1.413.588T18 6v4.5l3.15-3.15q.25-.25.55-.125t.3.475v8.6q0 .35-.3.475t-.55-.125L18 13.5V18q0 .825-.587 1.413T16 20zm0-2h12V6H4zm0 0V6z' },
  { label: 'Таблица', wrap: true, path: 'M5 13h6V9H5zm0-6h14V5H5zm9 15q-.425 0-.712-.288T13 21v-1.25q0-.4.163-.763t.437-.637l4.925-4.925q.225-.225.5-.325t.55-.1q.3 0 .575.113t.5.337l.925.925q.2.225.313.5t.112.55t-.1.563t-.325.512l-4.925 4.925q-.275.275-.637.425t-.763.15zm6.5-6.575l-.925-.925zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v5.175q0 .425-.288.713t-.712.287t-.712-.288t-.288-.712V9h-6v4h1.9q.35 0 .475.3t-.125.55l-3.4 3.4q-.25.25-.55.125T11 16.9V15H5v4h5q.425 0 .713.288T11 20t-.288.713T10 21zm0-2v-4zm8-6V9zm1.5 7.5h.95l3.025-3.05l-.925-.925l-3.05 3.025zm3.525-3.525l-.475-.45l.925.925z' },
  { label: 'Код', wrap: true, path: 'M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V8H4zm4.675-5l-1.9-1.9q-.3-.3-.288-.7t.313-.7q.3-.275.7-.287t.7.287l2.6 2.6q.3.3.3.7t-.3.7l-2.6 2.6q-.275.275-.687.288T6.8 16.3q-.275-.275-.275-.7t.275-.7zM13 17q-.425 0-.712-.288T12 16t.288-.712T13 15h4q.425 0 .713.288T18 16t-.288.713T17 17z' },
]

function StepMinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={rs('priceRangeStepIcon')} aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function StepPlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={rs('priceRangeStepIcon')} aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SubscriptionCreateContent({ locale }: { locale: string }) {
  const tr = useCallback((s: string) => t(locale, s), [locale])
  const router = useRouter()
  const { user } = useAuth()
  const signIn = useSignInDrawer()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const nextPlanUid = useRef(3)
  const dragIndex = useRef<number | null>(null)
  const toggleBaseId = useId()

  const [title, setTitle] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [cardColor, setCardColor] = useState<CardColor>('auto')
  const [plans, setPlans] = useState<PlanRow[]>([
    { uid: 0, months: 1, price: 0 },
    { uid: 1, months: 6, price: 0 },
    { uid: 2, months: 12, price: 0 },
  ])
  const [description, setDescription] = useState('')
  const [webhookMethod, setWebhookMethod] = useState<'POST' | 'GET'>('POST')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [apiKey, setApiKey] = useState(DEFAULT_API_KEY)
  const [serviceId] = useState(DEFAULT_SERVICE_ID)
  const [webhookParams, setWebhookParams] = useState<WebhookParams>({
    user: true,
    steamid: false,
    discordid: false,
    servers: false,
    domains: false,
    apikey: true,
    service: true,
  })
  const [pending, setPending] = useState(false)

  const categoryLabel = CATEGORIES.find((c) => c.value === category)?.label ?? 'Другое'

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('resource-form-dock')
    return () => root.classList.remove('resource-form-dock')
  }, [])

  const copyText = useCallback((value: string) => {
    try {
      void navigator.clipboard?.writeText(value)
    } catch {
    }
  }, [])

  const randomHex = useCallback((length: number) => {
    const bytes = new Uint8Array(Math.ceil(length / 2))
    try {
      crypto.getRandomValues(bytes)
    } catch {
      for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
    }
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').slice(0, length)
  }, [])

  const setPlanMonths = (uid: number, months: number) =>
    setPlans((prev) => prev.map((p) => (p.uid === uid ? { ...p, months: Math.max(1, months) } : p)))
  const setPlanPrice = (uid: number, price: number) =>
    setPlans((prev) => prev.map((p) => (p.uid === uid ? { ...p, price: Math.max(0, price) } : p)))
  const removePlan = (uid: number) => setPlans((prev) => prev.filter((p) => p.uid !== uid))
  const addPlan = () => setPlans((prev) => [...prev, { uid: nextPlanUid.current++, months: 1, price: 0 }])
  const reorderPlan = (from: number, to: number) =>
    setPlans((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })

  const resetToDefaults = () => {
    setTitle('')
    setShortDescription('')
    setCategory('other')
    setCardColor('auto')
    nextPlanUid.current = 3
    setPlans([
      { uid: 0, months: 1, price: 0 },
      { uid: 1, months: 6, price: 0 },
      { uid: 2, months: 12, price: 0 },
    ])
    setDescription('')
    setWebhookMethod('POST')
    setWebhookUrl('')
    setApiKey(DEFAULT_API_KEY)
    setWebhookParams({ user: true, steamid: false, discordid: false, servers: false, domains: false, apikey: true, service: true })
  }

  const clearAll = () => {
    setTitle('')
    setShortDescription('')
    setCategory('other')
    setCardColor('auto')
    nextPlanUid.current = 1
    setPlans([{ uid: 0, months: 1, price: 0 }])
    setDescription('')
    setWebhookUrl('')
  }

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (pending) return
      if (!user) {
        signIn.open()
        return
      }
      setPending(true)
      const payload = {
        name: title.trim(),
        category,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        cardColor: cardColor === 'auto' ? null : cardColor,
        plans: plans.map((p) => ({ periodMonths: p.months, priceRubles: p.price })),
        webhook: {
          method: webhookMethod,
          url: webhookUrl.trim() ? `https://${webhookUrl.trim()}` : '',
          apiKey,
          params: WEBHOOK_PARAMS.filter((p) => webhookParams[p.key]).map((p) => p.key),
        },
      }
      try {
        const res = await fetch('/api/subscriptions/offerings', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(payload),
        })
        if (res.status === 401) {
          signIn.open()
          setPending(false)
          return
        }
        if (!res.ok) throw new Error(`create offering ${res.status}`)
        router.push('/subscriptions')
      } catch {
        setPending(false)
      }
    },
    [apiKey, cardColor, category, description, pending, plans, router, shortDescription, signIn, title, user, webhookMethod, webhookParams, webhookUrl],
  )

  return (
    <section className={rd('resourceDetailPage')}>
      <div className={'container ' + rd('resourceDetailPageInner')}>
        <form className={arc('form')} onSubmit={submit}>
          <header className={phb('headerBar')}>
            <div className={phb('headerBar__start')}>
              <h1 className={phb('headerBar__title')}>{tr('Новый сервис')}</h1>
            </div>
            <div className={phb('headerBar__end')}>
              <span className={phb('headerBar__divider')} aria-hidden="true"></span>
              <div className={phb('headerBar__actions')}>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={adm('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                    aria-label={tr('Назад к подпискам')}
                    onClick={() => router.push('/subscriptions')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={adm('tableIconButtonIcon')} aria-hidden="true">
                      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className={adm('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                    aria-label={tr('API документация')}
                    href="/seller/api-docs/subscriptions"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" className={adm('tableIconButtonIcon')}>
                      <path d={P_API_DOCS} />
                    </svg>
                  </a>
                </span>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={adm('tableIconButton', 'tableIconButtonDanger') + ' ' + arc('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}
                    aria-label={tr('Очистить всё')}
                    onClick={clearAll}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={adm('tableIconButtonIcon')} aria-hidden="true">
                      <path d={P_ERASER} />
                    </svg>
                  </button>
                </span>
                <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                  <button
                    type="button"
                    className={adm('tableIconButton', 'tableIconButtonDanger') + ' ' + arc('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}
                    aria-label={tr('Сбросить')}
                    onClick={resetToDefaults}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={adm('tableIconButtonIcon')} aria-hidden="true">
                      <path d={P_RESET} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>
          </header>

          <div className={arc('createWizardPanel')}>
            <div className={arc('content')}>
              <div className={arc('gallery')}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className={arc('hiddenFileInput')}
                  tabIndex={-1}
                />
                <div className={arc('mediaVariantSlot', 'mediaVariantSlotFull') + ' ' + sub('coverSlot')}>
                  <div className={arc('mediaVariantHeader')}>
                    <span className={arc('mediaVariantLabel')}>{tr('Картинка')}</span>
                    <span className={arc('mediaVariantHint')}>16:10 (1920×1200px)</span>
                  </div>
                  <button
                    className={arc('mediaVariantUploadHit', 'extraImageSlotCatalogBox')}
                    type="button"
                    aria-label={tr('Загрузить изображение каталога')}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={arc('addIcon')}>
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className={rd('info') + ' ' + arc('contentInfoCol')}>
                <div className={arc('editorMain')}>
                  <div className={arc('editorLead')}>
                    <div className={rd('detailLead') + ' ' + arc('editorDetailLead')}>
                      <div className={rd('detailLeadText')}>
                        <input
                          className={inp('input', 'inputDarkDefault') + ' ' + arc('resourceTitleInput')}
                          type="text"
                          placeholder={tr('Название сервиса')}
                          aria-label={tr('Название сервиса')}
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className={arc('editorLeadBody')}>
                      <div className={arc('categoryGameRow')}>
                        <div className={arc('formGroup')}>
                          <span className="form-label">{tr('Категория')}</span>
                          <div className={dd('dropdown')}>
                            <button
                              type="button"
                              className={dd('trigger', 'triggerHasOptionIcon') + ' ' + arc('editorLeadControlTrigger') + (categoryOpen ? ' ' + dd('triggerOpen') : '')}
                              aria-expanded={categoryOpen}
                              aria-haspopup="listbox"
                              aria-label={tr('Категория')}
                              onClick={() => setCategoryOpen((v) => !v)}
                              onBlur={() => setCategoryOpen(false)}
                            >
                              <span className={dd('triggerContent', 'triggerContentWithOptionIcon')}>
                                <span className={dd('triggerOptionIconWrap')} aria-hidden="true">
                                  <span className={cat('icon') + ' ' + dd('optionIcon')} aria-hidden="true">
                                    <svg viewBox="0 0 512 512" overflow="visible" focusable="false">
                                      <path d={P_CATEGORY} fill="currentColor" />
                                    </svg>
                                  </span>
                                </span>
                                <span className={dd('triggerLabelWithOptionIcon')}>{tr(categoryLabel)}</span>
                              </span>
                              <svg viewBox="0 0 24 24" fill="none" className={dd('icon') + '  ' + (categoryOpen ? dd('iconOpen') : '')} aria-hidden="true">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            {categoryOpen && (
                              <div className={dd('menu', 'slideDown', 'surfaceDarkDefault')} role="listbox">
                                {CATEGORIES.map((c) => (
                                  <button
                                    key={c.value}
                                    type="button"
                                    role="option"
                                    aria-selected={c.value === category}
                                    className={dd('optionLabelGroup')}
                                    onMouseDown={(ev) => {
                                      ev.preventDefault()
                                      setCategory(c.value)
                                      setCategoryOpen(false)
                                    }}
                                  >
                                    <span className={dd('optionIcon')} aria-hidden="true">
                                      <span className={cat('icon')} aria-hidden="true">
                                        <svg viewBox="0 0 512 512" overflow="visible" focusable="false">
                                          <path d={P_CATEGORY} fill="currentColor" />
                                        </svg>
                                      </span>
                                    </span>
                                    <span className={dd('optionLabelText')}>{tr(c.label)}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={arc('formGroup')}>
                          <label className="form-label" htmlFor="subscription-form-description">{tr('Краткое описание')}</label>
                          <input
                            className={inp('input') + ' ' + arc('titleInputBare')}
                            id="subscription-form-description"
                            type="text"
                            placeholder={tr('Кратко для карточки сервиса и поиска')}
                            aria-label={tr('Краткое описание для карточки')}
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={arc('formGroup')}>
                    <span className="form-label">{tr('Цвет карточки')}</span>
                    <div className={sub('lookCustomWrap')}>
                      <div className={sub('lookSwatches')}>
                        <button
                          type="button"
                          className={sub('lookSwatch', 'lookSwatchAuto') + (cardColor === 'auto' ? ' ' + sub('lookSwatchOn') : '')}
                          aria-label={tr('Цвет сайта')}
                          aria-pressed={cardColor === 'auto'}
                          data-tooltip-trigger=""
                          onClick={() => setCardColor('auto')}
                        ></button>
                        {CARD_COLORS.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            className={sub('lookSwatch') + (cardColor === hex ? ' ' + sub('lookSwatchOn') : '')}
                            style={swatchVar(hex)}
                            aria-label={hex}
                            aria-pressed={cardColor === hex}
                            data-tooltip-trigger=""
                            onClick={() => setCardColor(hex)}
                          ></button>
                        ))}
                        <button
                          type="button"
                          className={sub('lookSwatch', 'lookSwatchCustom') + (cardColor === 'custom' ? ' ' + sub('lookSwatchOn') : '')}
                          aria-label={tr('Свой цвет')}
                          aria-pressed={cardColor === 'custom'}
                          data-tooltip-trigger=""
                          onClick={() => setCardColor('custom')}
                        ></button>
                      </div>
                    </div>
                  </div>

                  <div className={arc('formGroup')}>
                    <div className={sub('planEditList')} aria-label={tr('Тарифы')}>
                      <div className={sub('planEditHead')}>
                        <span></span>
                        <span className={sub('planEditHeadFields')}>
                          <span>{tr('Месяцев')}</span>
                          <span>{tr('Цена')}</span>
                        </span>
                        <span></span>
                      </div>
                      {plans.map((plan, index) => (
                        <div
                          key={plan.uid}
                          className={sub('planEditRow')}
                          onDragOver={(e) => {
                            if (dragIndex.current !== null) e.preventDefault()
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            if (dragIndex.current !== null) reorderPlan(dragIndex.current, index)
                            dragIndex.current = null
                          }}
                        >
                          <button
                            type="button"
                            className={sub('planEditPlaque', 'planEditGrip')}
                            draggable
                            aria-label={tr('Перетащить')}
                            onDragStart={() => {
                              dragIndex.current = index
                            }}
                            onDragEnd={() => {
                              dragIndex.current = null
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" fill="currentColor" className={sub('planEditIcon')} aria-hidden="true">
                              <path d={P_GRIP} />
                            </svg>
                          </button>
                          <div className={sub('planEditFields')}>
                            <div className={rs('priceRangeStepper')}>
                              <button
                                type="button"
                                className={rs('priceRangeStepBtn')}
                                aria-label={tr('Уменьшить: Месяцев')}
                                onClick={() => setPlanMonths(plan.uid, plan.months - 1)}
                              >
                                <StepMinusIcon />
                              </button>
                              <input
                                type="number"
                                min={1}
                                aria-label={tr('Месяцев')}
                                className={rs('priceRangeInput', 'priceRangeInputInStepper')}
                                value={plan.months}
                                onChange={(e) => setPlanMonths(plan.uid, Number(e.target.value) || 1)}
                              />
                              <button
                                type="button"
                                className={rs('priceRangeStepBtn')}
                                aria-label={tr('Увеличить: Месяцев')}
                                onClick={() => setPlanMonths(plan.uid, plan.months + 1)}
                              >
                                <StepPlusIcon />
                              </button>
                            </div>
                            <div className={rs('priceRangeStepper')}>
                              <button
                                type="button"
                                className={rs('priceRangeStepBtn')}
                                aria-label={tr('Уменьшить: Цена')}
                                onClick={() => setPlanPrice(plan.uid, plan.price - 1)}
                              >
                                <StepMinusIcon />
                              </button>
                              <input
                                type="number"
                                min={0}
                                aria-label={tr('Цена')}
                                className={rs('priceRangeInput', 'priceRangeInputInStepper')}
                                value={plan.price}
                                onChange={(e) => setPlanPrice(plan.uid, Number(e.target.value) || 0)}
                              />
                              <button
                                type="button"
                                className={rs('priceRangeStepBtn')}
                                aria-label={tr('Увеличить: Цена')}
                                onClick={() => setPlanPrice(plan.uid, plan.price + 1)}
                              >
                                <StepPlusIcon />
                              </button>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={sub('planEditPlaque', 'planEditPlaqueDanger')}
                            aria-label={tr('Удалить')}
                            data-tooltip-trigger=""
                            onClick={() => removePlan(plan.uid)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" className={sub('planEditIcon')} aria-hidden="true">
                              <path d={P_TRASH} />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button className={btn('button', 'secondary')} type="button" onClick={addPlan}>
                        {tr('Добавить срок')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <section className={rd('fullDescription') + ' ' + arc('fullDescriptionAfterGap')} aria-labelledby="subscription-form-full-desc-heading">
              <header className={phb('headerBar')}>
                <div className={phb('headerBar__start')}>
                  <h2 className={phb('headerBar__title', 'headerBar__titleLevel2')} id="subscription-form-full-desc-heading">{tr('Подробное описание')}</h2>
                </div>
                <div className={phb('headerBar__end')}>
                  <span className={phb('headerBar__divider')} aria-hidden="true"></span>
                  <div className={phb('headerBar__actions')}>
                    <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                      <button
                        type="button"
                        className={adm('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderSemanticIconWarning')}
                        disabled={description.length === 0}
                        aria-label={tr('Очистить')}
                        onClick={() => setDescription('')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={adm('tableIconButtonIcon')} aria-hidden="true">
                          <path d={P_ERASER} />
                        </svg>
                      </button>
                    </span>
                  </div>
                </div>
              </header>
              <div className="resourceMdEditor">
                <div className="resourceMdEditor__toolbar">
                  <div className="resourceMdEditor__toolbarGroup">
                    {MD_TOOLBAR.map((tool) => {
                      const svg = (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="resourceMdEditor__glyph">
                          <path d={tool.path} />
                        </svg>
                      )
                      return tool.wrap ? (
                        <div key={tool.label} className="resourceMdEditor__toolMenuWrap">
                          <button type="button" className="resourceMdEditor__toolButton" aria-label={tr(tool.label)} data-tooltip-trigger="">
                            {svg}
                          </button>
                        </div>
                      ) : (
                        <button key={tool.label} type="button" className="resourceMdEditor__toolButton" aria-label={tr(tool.label)} data-tooltip-trigger="">
                          {svg}
                        </button>
                      )
                    })}
                    <span className="resourceMdEditor__toolbarGroup_right">
                      <button type="button" className="resourceMdEditor__toolButton resourceMdEditor__toolButton_hasLabel" aria-label={tr('Полный экран')} data-tooltip-trigger="">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="resourceMdEditor__glyph">
                          <path d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z" />
                        </svg>
                        <span className="resourceMdEditor__toolButtonLabel">{tr('Полный экран')}</span>
                      </button>
                    </span>
                  </div>
                </div>
                <div className="resourceMdEditor__content">
                  <div className="resourceMdEditor__editorPane">
                    <div className="resourceMdEditor__textareaShell">
                      <pre className="resourceMdEditor__textareaMirror" aria-hidden="true"><code>{description}</code></pre>
                      <textarea
                        className="resourceMdEditor__textarea"
                        placeholder={tr('Введите описание ресурса...')}
                        aria-label={tr('Подробное описание')}
                        spellCheck
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="resourceMdEditor__previewPane">
                    {description.trim().length === 0 ? (
                      <div className="resourceMdEditor__previewEmpty">{tr('Описание не указано')}</div>
                    ) : (
                      <div className="resourceMdEditor__markdownPreviewBody" style={{ whiteSpace: 'pre-wrap' }}>{description}</div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className={arc('settingsSection')}>
            <div className={arc('createWizardSettingsColumn')}>
              <section className={arc('settingsBlock')} aria-labelledby="subscription-webhook-heading">
                <header className={phb('headerBar') + ' ' + arc('settingsBlockHeader')}>
                  <div className={phb('headerBar__start') + ' ' + arc('settingsBlockHeaderStart')}>
                    <h2 className={phb('headerBar__title', 'headerBar__titleLevel2') + ' ' + arc('settingsBlockHeaderTitle')} id="subscription-webhook-heading">
                      <span className={arc('settingsBlockHeaderIconSlot')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" className={arc('settingsBlockHeaderIcon')}>
                          <path d={P_WEBHOOK} />
                        </svg>
                      </span>
                      <span className={arc('settingsBlockHeaderCopy')}>
                        <span>API Webhook</span>
                        <span className={arc('settingsBlockHeaderHint')}>{tr('Отправка данных о покупке на указанный URL')}</span>
                      </span>
                    </h2>
                  </div>
                  <div className={phb('headerBar__end')}>
                    <span className={phb('headerBar__divider')} aria-hidden="true"></span>
                    <div className={phb('headerBar__actions')}>
                      <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                        <button
                          type="button"
                          className={adm('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderSemanticIconWarning')}
                          aria-label={tr('Очистить')}
                          onClick={() => setWebhookUrl('')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" className={adm('tableIconButtonIcon')} aria-hidden="true">
                            <path d={P_ERASER} />
                          </svg>
                        </button>
                      </span>
                    </div>
                  </div>
                </header>
                <div className={arc('settingsPanelBody')}>
                  <div className={arc('settingsHintListBlock')}>
                    <div className={arc('webhookHintRow')}>
                      <div className={arc('settingsPanelHint', 'settingsPanelHintWithIcon')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={arc('settingsPanelHintIcon')} aria-hidden="true">
                          <path d={P_INFO} />
                        </svg>
                        <span className={arc('settingsPanelHintText')}>
                          {tr('Отправка событий подписки на ваш webhook. Тело — JSON (application/json). Ответ не обязателен. ')}
                          {tr('Запросы приходят только с IP ')}
                          <button type="button" className={arc('webhookInlineCode')} aria-label={tr('Копировать')} onClick={() => copyText(WEBHOOK_IP)}>
                            {WEBHOOK_IP}
                            <svg viewBox="0 0 640 640" fill="currentColor" className={arc('webhookCopyIpIcon')} aria-hidden="true">
                              <path d={P_COPY_INLINE} />
                            </svg>
                          </button>
                        </span>
                      </div>
                      <a href="/seller/api-docs/subscriptions" target="_blank" rel="noopener noreferrer" className={arc('webhookDocsLink')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" className={arc('webhookDocsLinkIcon')}>
                          <path d={P_API_DOCS} />
                        </svg>
                        {tr('Документация')}
                      </a>
                    </div>
                  </div>
                  <div className={arc('webhookUrlRow')}>
                    <div className={arc('formGroup')}>
                      <label className="form-label">{tr('HTTP-метод')}</label>
                      <div className={arc('settingsOptionWrap')}>
                        <div className={arc('optionGroup')} role="group" aria-label={tr('HTTP-метод запроса к webhook')}>
                          <button
                            type="button"
                            className={arc('optionBtn') + (webhookMethod === 'POST' ? ' ' + arc('optionBtnActive') : '') + ' ' + arc('webhookMethodBtn')}
                            aria-pressed={webhookMethod === 'POST'}
                            onClick={() => setWebhookMethod('POST')}
                          >
                            POST
                          </button>
                          <button
                            type="button"
                            className={arc('optionBtn') + (webhookMethod === 'GET' ? ' ' + arc('optionBtnActive') : '') + ' ' + arc('webhookMethodBtn')}
                            aria-pressed={webhookMethod === 'GET'}
                            onClick={() => setWebhookMethod('GET')}
                          >
                            GET
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={arc('formGroup')}>
                      <label className="form-label">{tr('URL webhook')}</label>
                      <div className={arc('guildPickerWithClear')}>
                        <div className={cr('sellerProjectInput') + ' ' + arc('linkDeliveryUrlHostWrap')}>
                          <span className={cr('sellerProjectPrefix')}>https://</span>
                          <input
                            type="text"
                            className={cr('sellerProjectInputField') + ' ' + arc('linkDeliveryUrlHostField')}
                            placeholder="example.com/api/webhook"
                            aria-label={tr('URL webhook')}
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className={arc('formGroup', 'webhookApiKeyGroup')}>
                      <label className="form-label">{tr('API-ключ продавца (64 символа)')}</label>
                      <div className={arc('webhookApiKeyRow')}>
                        <input
                          className={inp('input', 'inputDarkDefault') + ' ' + arc('settingsPanelField', 'webhookApiKeyInput')}
                          type="text"
                          readOnly
                          aria-label={tr('API-ключ для проверки подлинности запросов')}
                          value={apiKey}
                        />
                        <div className={arc('webhookUrlKeyActions')}>
                          <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                            <button
                              type="button"
                              className={adm('tableIconButton') + ' ' + arc('formHeaderTableIconButton', 'formHeaderDefaultNavIconButton')}
                              aria-label={tr('Копировать')}
                              onClick={() => copyText(apiKey)}
                            >
                              <svg viewBox="0 0 640 640" fill="currentColor" className={adm('tableIconButtonIcon')} aria-hidden="true">
                                <path d={P_COPY_KEY} />
                              </svg>
                            </button>
                          </span>
                          <span className={arc('formHeaderTooltipAnchor')} data-tooltip-trigger="">
                            <button
                              type="button"
                              className={adm('tableIconButton', 'tableIconButtonDanger') + ' ' + arc('formHeaderTableIconButton', 'formHeaderSemanticIconDanger')}
                              aria-label={tr('Сгенерировать новый')}
                              onClick={() => setApiKey(randomHex(64))}
                            >
                              <svg viewBox="0 0 24 24" fill="none" className={adm('tableIconButtonIcon')} aria-hidden="true">
                                <path d={P_RESET} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={arc('webhookParamsRow')}>
                    <label className="form-label">{tr('Параметры в теле запроса')}</label>
                    <div className={arc('sellerAccessGroup')} role="group" aria-label={tr('Параметры, передаваемые на webhook')}>
                      {WEBHOOK_PARAMS.map((param) => {
                        const id = `${toggleBaseId}-${param.key}`
                        return (
                          <label key={param.key} className={tg('row') + ' ' + arc('sellerAccessToggleOneLine')} htmlFor={id}>
                            <span className={tg('wrap')}>
                              <input
                                type="checkbox"
                                id={id}
                                className={tg('input')}
                                checked={webhookParams[param.key]}
                                onChange={(e) => setWebhookParams((prev) => ({ ...prev, [param.key]: e.target.checked }))}
                              />
                              <span className={tg('slider')}></span>
                            </span>
                            <span className={tg('label')}>{param.label}</span>
                          </label>
                        )
                      })}
                    </div>
                    <button type="button" className={arc('webhookResourceId')} aria-label={tr('Копировать ID сервиса')} onClick={() => copyText(serviceId)}>
                      <span>{tr('ID сервиса:')}</span>
                      <span className={arc('webhookResourceIdValue')}>{serviceId}</span>
                      <svg viewBox="0 0 640 640" fill="currentColor" className={arc('webhookCopyIpIcon')} aria-hidden="true">
                        <path d={P_COPY_INLINE} />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </section>

          <div className={arc('productManageCreateDock')} role="region" aria-label={tr('Управление и модерация')} style={dockLift}>
            <div className={arc('productManageDockActions')}>
              <div className={arc('productManageSaveRow')} role="group" aria-label={tr('Действия в конце формы')}>
                <button type="submit" className={arc('productManageSaveBtn')} disabled={pending}>
                  {pending ? tr('Публикуем…') : tr('Опубликовать')}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
