import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { QueryClient } from '@tanstack/react-query'
import { grpcClient, restClient, graphqlClient } from '../../lib/user'
import { UserResponse } from '../../proto/simple-grpc'
import { UsersDocument, UsersQuery } from '../../graphql/simple-gql'

type User = { [key: string]: any }

export const getServerSideProps: GetServerSideProps<{
  users: User[]
}> = async ({ query }) => {
  const users: User[] = []

  if (query.protocol == 'grpc') {
    const stream = grpcClient.getUsers({})

    await new Promise<User[]>((resolve, reject) => {
      stream.on("data", (user: UserResponse) => {
        users.push(JSON.parse(JSON.stringify(user)))
      })
      stream.on("end", () => {
        resolve(users)
      })
      stream.on("error", (err) => {
        reject(err)
      })
    })
  } else if (query.protocol == 'graphql') {
    const response = await new QueryClient().fetchQuery(['users'], async () => {
      return graphqlClient<UsersQuery>(UsersDocument)
    })
    response.data.users?.forEach(
      user => users.push(JSON.parse(JSON.stringify(user)))
    )
  } else {
    (await restClient.getUsers()).forEach(
      user => users.push(user)
    )
  }
  return {
    props: {
      users
    }
  }
}

export default function Page({
  users
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          {user.email}
        </li>
      ))}
    </ul>
  )
}
