import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CodeBlock = ({ code }: { code: string }) => (
  <pre className="bg-muted p-4 rounded-lg text-sm text-muted-foreground overflow-x-auto">
    <code>{code}</code>
  </pre>
);

const searchExampleResponse = `{
  "data": [
    {
      "id": "busi_12345",
      "name": "Maple Syrup Inc.",
      "province": "QC",
      "address": "123 Sugar Shack Lane",
      "category": "Food Manufacturing",
      "city": "Montreal",
      "postal_code": "H1A 0A1"
    }
  ],
  "has_more": false
}`;

const categoryExampleResponse = `{
  "data": [
    {
      "id": "busi_67890",
      "name": "Digital Beavers",
      "province": "ON",
      "address": "456 Tech Street",
      "category": "Software Development",
      "city": "Toronto",
      "postal_code": "M5V 2T6"
    }
  ],
  "has_more": true
}`;


export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">
          API Documentation
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Integrate Canadian business data into your application with our simple REST API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            All API requests must be authenticated using an API key. Pass your key in the <code className="bg-muted px-1 py-0.5 rounded">Authorization</code> header as a Bearer token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code="Authorization: Bearer <YOUR_API_KEY>" />
        </CardContent>
      </Card>

      <div className="space-y-8" id="endpoints">
        <h2 className="text-2xl font-bold font-headline border-b pb-2">Endpoints</h2>
        
        {/* Endpoint: Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
              <span>/businesses/search</span>
            </CardTitle>
            <CardDescription>Search for businesses by name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Query Parameters</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="font-mono">name</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>The name of the business to search for. (Required)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <h4 className="font-semibold mt-4">Example Response</h4>
            <CodeBlock code={searchExampleResponse} />
          </CardContent>
        </Card>

        {/* Endpoint: Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
              <span>/businesses/category</span>
            </CardTitle>
            <CardDescription>
              Fetch businesses belonging to a specific category (NAICS code or description).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h4 className="font-semibold">Query Parameters</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><code className="font-mono">type</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>The business category or NAICS code. (Required)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <h4 className="font-semibold mt-4">Example Response</h4>
            <CodeBlock code={categoryExampleResponse} />
          </CardContent>
        </Card>
         
        {/* Other Endpoints Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
              <span>/businesses/city</span>
            </CardTitle>
            <CardDescription>
             Fetch businesses within a specific city.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">GET</Badge>
              <span>/businesses/nearby</span>
            </CardTitle>
            <CardDescription>
              Find businesses near a specific geographic coordinate.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
