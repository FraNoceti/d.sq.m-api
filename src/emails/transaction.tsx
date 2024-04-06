import {
  Body,
  Button,
  Column,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ThankYouTxInterface {
  partnerName?: string;
  sqm?: number;
  reserveName?: string;
}

export const ThankYouTx = ({
  partnerName = "Francesco",
  reserveName = "Yanacocha",
  sqm = 10,
}: ThankYouTxInterface) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Rubik"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap",
            format: "opentype",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Thank you for your contribution - {reserveName} reserve |
        InvestConservation
      </Preview>
      <Tailwind>
        <Body className="my-auto mx-auto font-[Rubik] leading-normal">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto py-[20px] px-[40px] max-w-[480px] shadow-xl">
            <Section className="mb-[30px]">
              <Link href="https://investconservation.com/">
                <Img
                  src={`https://utfs.io/f/60157288-a466-4e2d-ac98-db51de0cc4ef-jbtzxz.png`}
                  width="200"
                  height="68"
                  alt="IC"
                  className=""
                />
              </Link>
            </Section>
            <Text className="text-black text-[24px] font-light tracking-tighter leading-tight">
              Thank you for your contribution towards biodiversity conservation.
            </Text>
            <Text className="text-black text-[16px] font-normal">
              By completing your purchase through our partner {partnerName}, you
              contribuited to protect{" "}
              <span className="font-medium">{sqm} sq.m.</span> of land in{" "}
              <span className="font-medium">{reserveName}</span>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[12px] text-justify leading-normal">
              InvestConservation® projects employ advanced technology including
              satellite, camera traps, soundscapes and AI for transparent and
              independent data assessment. A minimum of 85% of every dollar
              invested goes to on the ground conservation efforts where we
              partner with local conservation groups with a proven track record.
              <strong> Fundación Jocotoco</strong>, a world renowned Ecuadorian
              conservation group uses science based conservation, employs 104
              Ecuadorian nationals and manages Copalinga and 14 other reserves
              in Ecuador.
            </Text>

            <Text className="text-center mt-10 mb-6">
              Best regards, <span className="font-medium">the IC Team.</span>
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />
            <Text className="text-[#666666] text-[11px]  leading-normal">
              Want to see more of our projects visit:
              <br />
              <Link href="https://investconservation.com/#projects">
                https://investconservation.com/#projects
              </Link>
              <br />
              Do you have further questions or feedback? <br />
              Write to us at{" "}
              <Link href="mailto:info@investconservation.com">
                info@investconservation.com
              </Link>
              <br />
              Join InvestConservation® latest developments
              <br /> and community discussions on{" "}
              <Link href="https://www.linkedin.com/company/investconservation/">
                LinkedIn
              </Link>
              .
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ThankYouTx;
