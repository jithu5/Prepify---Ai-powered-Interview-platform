"use client"
import React from 'react'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

const demoPosts = [
    {
        id: "post1",
        title: "How to scale a Node.js app?",
        tags: ["Node.js", "Backend", "Scalability"],
        date: "2025-04-10",
        likes: 5,
    },
    {
        id: "post2",
        title: "Tips for better technical interviews",
        tags: ["Interview", "Tips"],
        date: "2025-04-05",
        likes: 10,
    },
]

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    })

function PostTab() {
  return (
    <>
          {demoPosts.map((post) => (
              <Card key={post.id} className="p-4 my-2">
                  <h3 className="font-semibold">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                      Posted on: {formatDate(post.date)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                      {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                              {tag}
                          </Badge>
                      ))}
                  </div>
                  <p className="text-sm mt-2">❤️ {post.likes} likes</p>
              </Card>
          ))}
    </>
  )
}

export default PostTab
