'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Users, BarChart3, Share2, Award } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Personame
            </span>
          </Link>
          <Badge variant="secondary">Demo / Preview</Badge>
        </nav>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Feature Preview
            </h1>
            <p className="text-xl text-gray-600">
              Explore what makes Personame special
            </p>
          </div>

          {/* Creation Flow Preview */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Quiz Creation Flow</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-purple-600">1</span>
                  </div>
                  <CardTitle>Define Metrics</CardTitle>
                  <CardDescription>
                    Create 3-5 personality dimensions like "Openness" or "Extraversion"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Extraversion</span>
                      <Badge variant="outline">0-100</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Openness</span>
                      <Badge variant="outline">0-100</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>Conscientiousness</span>
                      <Badge variant="outline">0-100</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-pink-200">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-pink-600">2</span>
                  </div>
                  <CardTitle>Create Archetypes</CardTitle>
                  <CardDescription>
                    Design personality types with target metric values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🦅</span>
                        <span className="font-semibold">The Leader</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">High extraversion, high conscientiousness</p>
                    </div>
                    <div className="p-3 border-l-4 border-green-400 bg-green-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🦉</span>
                        <span className="font-semibold">The Thinker</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">High openness, low extraversion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">3</span>
                  </div>
                  <CardTitle>Build Questions</CardTitle>
                  <CardDescription>
                    Create questions that measure your metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="font-medium mb-2">How do you spend your weekends?</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>• With many friends</span>
                          <span className="text-purple-600">+Extraversion</span>
                        </div>
                        <div className="flex justify-between">
                          <span>• Reading alone</span>
                          <span className="text-purple-600">-Extraversion</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Powerful Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Analytics Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Track views, completions, and archetype distributions in real-time
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-pink-600 mb-2" />
                  <CardTitle>Coverage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Visualize how well your questions map to your archetypes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle>Comparative Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Show participants how they compare to others who took the quiz
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Share2 className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle>Social Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Beautiful share cards for social media with custom results
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Award className="h-8 w-8 text-yellow-600 mb-2" />
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Reward users for completing quizzes and discovering new archetypes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Sparkles className="h-8 w-8 text-purple-600 mb-2" />
                  <CardTitle>Beautiful Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Stunning visualizations with radar charts and metric breakdowns
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Example Result Preview */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Example Quiz Result</h2>
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="text-6xl mb-4">🦅</div>
                <CardTitle className="text-3xl">You are a Leader!</CardTitle>
                <CardDescription className="text-lg">
                  You thrive in social situations and excel at organizing people and projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Extraversion</span>
                    <span className="text-purple-600 font-bold">85/100</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: '85%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">You're more extraverted than 89% of people</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Conscientiousness</span>
                    <span className="text-purple-600 font-bold">78/100</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: '78%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">You're more conscientious than 72% of people</p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Openness</span>
                    <span className="text-purple-600 font-bold">62/100</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: '62%' }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">You're more open than 58% of people</p>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>🦅 Leader (You!): 23%</span>
                    <span>🦉 Thinker: 31%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>🌟 Creator: 28%</span>
                    <span>🛡️ Guardian: 18%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Take Another Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-xl mb-8 opacity-90">
              All these features are waiting for you
            </p>
            <Link href="/create">
              <Button size="lg" variant="secondary">
                Create Your First Personame
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
