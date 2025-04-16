type props = {
    title: string;
    image: string | undefined;
    generator: string;
};

export default function Metadata({ title, image, generator }: props) {
    return (
        <head>
            <meta charset='UTF-8' />
            <meta name='viewport' content='width=device-width' />
            <link rel='icon' type='image/svg+xml' href={image} />
            <meta name='generator' content={generator} />
            <title>{title}</title>
        </head>
    );
};
