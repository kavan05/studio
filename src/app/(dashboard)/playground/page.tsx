
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient, Business } from '@/lib/api-client';
import { Loader2, Search, MapPin, Building2, ChevronRight, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PlaygroundPage() {
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Business[]>([]);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const { toast } = useToast();

  // Search state
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [nearbyLat, setNearbyLat] = useState('43.65');
  const [nearbyLng, setNearbyLng] = useState('-79.38');
  const [nearbyRadius, setNearbyRadius] = useState('10');

  useEffect(() => {
    if (user) {
      const fetchApiKey = async () => {
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setApiKey(userDoc.data().apiKey);
        }
      };
      fetchApiKey();
    }
  }, [user, firestore]);

  const handleSearch = async (type: 'name' | 'category' | 'city' | 'nearby') => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Missing',
        description: 'Could not find your API key. Please try refreshing.',
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setResponseTime(null);

    const startTime = Date.now();

    try {
      let response;

      switch (type) {
        case 'name':
          if (!searchName) throw new Error('Please enter a business name');
          response = await apiClient.searchBusinesses(apiKey, searchName);
          break;
        case 'category':
          if (!searchCategory) throw new Error('Please enter a category');
          response = await apiClient.getBusinessesByCategory(apiKey, searchCategory);
          break;
        case 'city':
          if (!searchCity) throw new Error('Please enter a city');
          response = await apiClient.getBusinessesByCity(apiKey, searchCity);
          break;
        case 'nearby':
          response = await apiClient.getNearbyBusinesses(
            apiKey,
            parseFloat(nearbyLat),
            parseFloat(nearbyLng),
            parseFloat(nearbyRadius)
          );
          break;
      }

      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      setResults(response.data);
      
      toast({
        title: 'Success',
        description: `Found ${response.data.length} businesses in ${endTime - startTime}ms`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch businesses',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user || !apiKey) {
    return (
       <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            Could not load user data or API key. Please try logging in again.
          </AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">API Playground</h1>
        <p className="text-muted-foreground mt-2">
          Test API endpoints interactively. Your API key is automatically used.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
          <TabsTrigger value="city">City</TabsTrigger>
          <TabsTrigger value="nearby">Nearby</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search by Name
              </CardTitle>
              <CardDescription>Find businesses by their name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Business Name</Label>
                <Input
                  id="search-name"
                  placeholder="e.g., Maple Leaf"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('name')}
                />
              </div>
              <Button onClick={() => handleSearch('name')} disabled={loading || !searchName}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Search by Category
              </CardTitle>
              <CardDescription>Filter businesses by category or NAICS code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-category">Category</Label>
                <Input
                  id="search-category"
                  placeholder="e.g., Restaurant, Manufacturing"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('category')}
                />
              </div>
              <Button onClick={() => handleSearch('category')} disabled={loading || !searchCategory}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="city">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Search by City
              </CardTitle>
              <CardDescription>Find businesses in a specific city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search-city">City Name</Label>
                <Input
                  id="search-city"
                  placeholder="e.g., Toronto, Vancouver"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch('city')}
                />
              </div>
              <Button onClick={() => handleSearch('city')} disabled={loading || !searchCity}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nearby">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Search Nearby
              </CardTitle>
              <CardDescription>Find businesses near geographic coordinates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="0.0001"
                    value={nearbyLat}
                    onChange={(e) => setNearbyLat(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="0.0001"
                    value={nearbyLng}
                    onChange={(e) => setNearbyLng(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={nearbyRadius}
                  onChange={(e) => setNearbyRadius(e.target.value)}
                />
              </div>
              <Button onClick={() => handleSearch('nearby')} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Info */}
      {responseTime !== null && (
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Response Time:</span>
              <span className="font-mono font-semibold">{responseTime}ms</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results ({results.length})</CardTitle>
            <CardDescription>Showing businesses matching your search criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((business) => (
                <div key={business.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold text-lg">{business.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {business.address}, {business.city}, {business.province} {business.postal_code}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {business.category && (
                          <span className="text-xs px-2 py-1 bg-accent/20 rounded">
                            {business.category}
                          </span>
                        )}
                        {business.province && (
                          <span className="text-xs px-2 py-1 bg-secondary rounded">
                            {business.province}
                          </span>
                        )}
                      </div>
                      {business.phone && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Phone:</span> {business.phone}
                        </p>
                      )}
                      {business.website && (
                        <p className="text-sm">
                          <span className="font-medium">Website:</span>{' '}
                          <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {business.website}
                          </a>
                        </p>
                      )}
                      {business.distance !== undefined && (
                        <p className="text-sm font-medium text-accent">
                          {business.distance} km away
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No results yet. Try searching for businesses above.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
