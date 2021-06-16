const foo = async (): Promise<number> => {
  return 100
}
const main = async () => {
  await foo()
}
main()
