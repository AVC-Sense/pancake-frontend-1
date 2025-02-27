import { GraphQLClient } from 'graphql-request'

const requestWithTimeout = <T>(
  graphQLClient: GraphQLClient,
  request: string,
  variables?: any,
  timeout = 100000000,
): Promise<T> => {
  // return variables ? graphQLClient.request<T>(request, variables) : graphQLClient.request<T>(request),

  return Promise.race([
    variables ? graphQLClient.request<T>(request, variables) : graphQLClient.request<T>(request),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeout} milliseconds`))
      }, timeout)
    }),
  ]) as Promise<T>
}

export default requestWithTimeout
