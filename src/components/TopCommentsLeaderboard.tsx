import { useKV } from '@github/spark/hooks'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { useState } from 'react'
import { Comment, TopComment } from '@/lib/content'
import { CaretUp, CaretDown, Trophy, Medal, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'

export function TopCommentsLeaderboard() {
  const [comments, setComments] = useKV<Comment[]>('top-comments', [])
  const [newComment, setNewComment] = useState('')
  const [authorName, setAuthorName] = useState('')

  const topThree = (comments || [])
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 3)
    .map((comment, index): TopComment => ({
      ...comment,
      rank: index + 1,
      badge: index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'
    }))

  const handleSubmit = () => {
    if (newComment.trim().length === 0 || newComment.length > 200) {
      toast.error('Comment must be between 1 and 200 characters')
      return
    }

    if (authorName.trim().length === 0) {
      toast.error('Please enter your name')
      return
    }

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      votes: 0,
      author: authorName.trim(),
      timestamp: Date.now()
    }

    setComments((current) => [...(current || []), comment])
    setNewComment('')
    setAuthorName('')
    toast.success('Comment submitted! Others can now vote on it.')
  }

  const handleVote = (commentId: string, delta: number) => {
    setComments((current) =>
      (current || []).map((c) =>
        c.id === commentId ? { ...c, votes: Math.max(0, c.votes + delta) } : c
      )
    )
  }

  const getBadgeIcon = (badge: 'gold' | 'silver' | 'bronze') => {
    if (badge === 'gold') return <Trophy className="h-5 w-5 text-primary" weight="fill" />
    if (badge === 'silver') return <Medal className="h-5 w-5 text-muted-foreground" weight="fill" />
    return <Star className="h-5 w-5 text-accent" weight="fill" />
  }

  const charCount = newComment.length
  const charPercentage = (charCount / 200) * 100

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-semibold">Top 3 Hall of Fame</h2>
        <p className="text-sm text-muted-foreground">
          Share your best alarm troubleshooting tip (200 chars max). The community's favorites rise to the top!
        </p>
        <figure
          className="mt-4 overflow-hidden rounded-xl border border-border/60 shadow-sm"
          data-slot-id="45036d3d0a51"
        >
          <img
            src="/images/generated/45036d3d0a51.png"
            alt="Photo of Top 3 Hall of Fame"
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-auto w-full"
            data-slot-id="45036d3d0a51"
          />
        </figure>
      </div>

      {topThree.length > 0 ? (
        <div className="mb-6 space-y-4">
          {topThree.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-4"
            >
              <div className="flex flex-col items-center gap-1">
                {getBadgeIcon(comment.badge)}
                <span className="text-xs font-medium text-muted-foreground">#{comment.rank}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{comment.text}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>by {comment.author}</span>
                  <span>{comment.votes} votes</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleVote(comment.id, 1)}
                >
                  <CaretUp className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleVote(comment.id, -1)}
                >
                  <CaretDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
          <Trophy className="mx-auto mb-2 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Be the first to share a helpful tip!</p>
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Your Name</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            maxLength={50}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Your Tip</label>
            <Badge variant={charCount > 200 ? 'destructive' : 'secondary'}>
              {charCount}/200
            </Badge>
          </div>
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your best alarm troubleshooting tip..."
            className="min-h-[80px] resize-none"
            maxLength={200}
            id="comment-input"
          />
          <Progress value={charPercentage} className="mt-2 h-1" />
        </div>
        <Button onClick={handleSubmit} className="w-full" disabled={charCount === 0 || charCount > 200}>
          Submit Tip
        </Button>
      </div>
    </Card>
  )
}
