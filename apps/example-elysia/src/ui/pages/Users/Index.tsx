import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Layout } from "../../components/Layout";
import { FlashMessages } from "../../components/FlashMessages";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../components/ui/table";
import { PageProps } from "inertia-server";
import type { usersIndexPage } from "@/inertia";

export default function UsersIndex({ title, users, search, page, totalPages }: PageProps<typeof usersIndexPage>) {
	const [searchValue, setSearchValue] = useState(search);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		router.get("/users", { search: searchValue, page: 1 }, { preserveState: true, replace: false });
	};

	return (
		<Layout title={title}>
			<FlashMessages />

			<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<form onSubmit={handleSearch} className="flex gap-2">
					<Input
						type="text"
						name="search"
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						placeholder="Search users..."
						className="w-48"
					/>
					<Button type="submit">Search</Button>
				</form>

				<Button variant="success" asChild>
					<Link href="/users/create">Create User</Link>
				</Button>
			</div>

			<div className="rounded-sm border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead>Name</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Role</TableHead>
							<TableHead>Created</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{users.map((user) => (
							<TableRow key={user.id}>
								<TableCell className="font-medium">{user.name}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>{user.role}</TableCell>
								<TableCell className="text-muted-foreground">{user.createdAt}</TableCell>
								<TableCell className="text-right">
									<div className="flex items-center justify-end gap-2">
										<Button variant="ghost" size="sm" asChild>
											<Link href={`/users/${user.id}/edit`}>Edit</Link>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive hover:text-destructive"
											asChild
										>
											<Link
												href={`/users/${user.id}`}
												method="delete"
												as="button"
											>
												Delete
											</Link>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="mt-6 flex items-center justify-center gap-2">
					{page > 1 && (
						<Button variant="outline" size="sm" asChild>
							<Link href={`/users?page=${page - 1}&search=${search}`}>
								Previous
							</Link>
						</Button>
					)}
					<span className="px-4 text-sm text-muted-foreground">
						Page {page} of {totalPages}
					</span>
					{page < totalPages && (
						<Button variant="outline" size="sm" asChild>
							<Link href={`/users?page=${page + 1}&search=${search}`}>
								Next
							</Link>
						</Button>
					)}
				</div>
			)}
		</Layout>
	);
}
