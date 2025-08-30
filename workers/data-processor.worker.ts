self.onmessage = (e) => {
  const { data, processor } = e.data

  try {
    const processorFn = new Function("return " + processor)()
    const result = processorFn(data)

    self.postMessage({ result })
  } catch (error) {
    self.postMessage({ error: error.message })
  }
}

export {}
