import Link from 'next/link'


export default function NotFound() {
  return (
    <main className="notFoundPageMain">
      <div className="notFoundContent">
        <p className="notFoundContentCode">404</p>
        <h1 className="notFoundContentTitle">Страница не найдена</h1>
        <p className="notFoundContentText">
          Возможно, ссылка устарела или страница была перемещена.
        </p>
        <Link className="notFoundContentAction" href="/">
          На главную
        </Link>
      </div>
    </main>
  )
}
