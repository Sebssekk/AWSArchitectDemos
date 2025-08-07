package org.example;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.regions.providers.DefaultAwsRegionProviderChain;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.Bucket;
import software.amazon.awssdk.services.s3.model.ListObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsResponse;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.List;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        Region defaultRegion = DefaultAwsRegionProviderChain.builder().build().getRegion();
        S3Client s3 = S3Client.builder().region(defaultRegion).build();

        Optional<Bucket> bucket = s3.listBuckets().buckets()
                .stream().filter(
                        b -> b.name().contains("demo-public")
                ).findFirst();

        if (bucket.isPresent()){
            String bucketName = bucket.get().name();
            System.out.println("[+] Target bucket: " + bucketName);

            ListObjectsRequest listObject = ListObjectsRequest.builder()
                    .bucket(bucketName)
                    .build();
            ListObjectsResponse res = s3.listObjects(listObject);
            List<S3Object> s3Objs = res.contents();
            System.out.println("[+] Found objects: ");
            for (S3Object o : s3Objs){
                System.out.println("--- " + o.key() + " || Size: " + o.size() + " bytes");
            }
        } else {
            System.out.println("[X] No Bucket found... Did you run ../demo-cli/s3.sh ?" );
        }

    }
}