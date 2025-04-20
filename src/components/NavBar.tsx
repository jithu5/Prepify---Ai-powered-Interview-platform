import { Flex, Heading } from "@chakra-ui/react"

function NavBar() {
    return (
        <nav className="w-full px-10 py-12">
            <Flex justifyContent={"space-between"} alignItems={"center"} paddingX={"4"}>
                <Heading size={"6xl"} fontWeight={"bold"}>PREPIFY</Heading>

                <Flex alignItems={"center"} gap={4}>
                    <ul className="flex gap-4">
                        <li className="text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer">Home</li>
                        <li className="text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer">About</li>
                        <li className="text-lg font-semibold text-gray-700 hover:text-gray-900 cursor-pointer">Contact</li>
                    </ul>
                </Flex>
            </Flex>
        </nav>
    )
}

export default NavBar
